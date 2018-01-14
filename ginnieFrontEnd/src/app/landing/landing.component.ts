import { Component, OnInit, Input, NgZone  } from '@angular/core';
import { Cloudinary } from '@cloudinary/angular-4.x';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { print } from 'util';
import { Subject } from 'rxjs/Subject';
import { debounceTime } from 'rxjs/operator/debounceTime';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})

export class LandingComponent implements OnInit {
  @Input()
  responses: Array<any>;
  tags: Array<any>;

  private hasBaseDropZoneOver: boolean = false;
  private uploader: FileUploader;

  private allTags: Array<string>;
  private selectedTags: Array<string>;

  private _success = new Subject<string>();

  staticAlertClosed = false;
  successMessage: string;

  constructor(
    private cloudinary: Cloudinary,
    private zone: NgZone,
    private larry: HttpClient
  ) {
    this.responses = [];
    this.tags = [];
  }

  ngOnInit(): void {
    // Notification setup
    setTimeout(() => this.staticAlertClosed = true, 20000);
    this._success.subscribe((message) => this.successMessage = message);
    debounceTime.call(this._success, 5000).subscribe(() => this.successMessage = null);

    // Create the file uploader, wire it to upload to your account
    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${this.cloudinary.config().cloud_name}/upload`,
      // Upload files automatically upon addition to upload queue
      autoUpload: true,
      // Use xhrTransport in favor of iframeTransport
      isHTML5: true,
      // Calculate progress independently for each uploaded file
      removeAfterUpload: true,
      // XHR request headers
      headers: [
        {
          name: 'X-Requested-With',
          value: 'XMLHttpRequest'
        }
      ]
    };
    this.uploader = new FileUploader(uploaderOptions);

    this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      // Add Cloudinary's unsigned upload preset to the upload form
      form.append('upload_preset', this.cloudinary.config().upload_preset);
      // Add built-in and custom tags for displaying the uploaded photo in the list
      let tags = 'myphotoalbum';
      // Upload to a custom folder
      // Note that by default, when uploading via the API, folders are not automatically created in your Media Library.
      // In order to automatically create the folders based on the API requests,
      // please go to your account upload settings and set the 'Auto-create folders' option to enabled.
      form.append('folder', 'angular_sample');
      // Add custom tags
      form.append('tags', tags);
      // Add file to upload
      form.append('file', fileItem)

      // Use default "withCredentials" value for CORS requests
      fileItem.withCredentials = false;
      return { fileItem, form };
    };

    const makePostReq = function (data, larry){
      console.log('hello');
      const img_url = {'imageUri' : data};
      console.log(img_url);
      const server_url = 'https://nameless-headland-72211.herokuapp.com/api/image';

      const headers = new HttpHeaders();
      const options = { headers: headers };

      larry.post(server_url, img_url, options).subscribe(
        resp => {

          console.log(`POST request made to - ${server_url} with image url - ${img_url}`);
          console.log(resp);
          updateTags(resp);
          triggerTagCreation(resp);
  
        },
        error => {
          console.log(error);
          console.log('Failed to make POST request');
        });
     };

     const triggerTagCreation = data => {
       this.createTagButtons();
     }

     const updateTags = data => {
      console.log(this.tags);
      console.log(data);
       
       for (var i = 0; i < data.length; i++) {
        this.tags.push(data[i]);
      };
      console.log(this.tags)
     }

    // Insert or update an entry in the responses array
    const upsertResponse = fileItem => {
      console.log(this.responses);

      // Run the update in a custom zone since for some reason change detection isn't performed
      // as part of the XHR request to upload the files.
      // Running in a custom zone forces change detection
      this.zone.run(() => {
        // Update an existing entry if it's upload hasn't completed yet

        // Find the id of an existing item
        const existingId = this.responses.reduce((prev, current, index) => {
          if (current.file.name === fileItem.file.name && !current.status) {
            return index;
          }
          return prev;
        }, -1);
        if (existingId > -1) {
          // Update existing item with new data
          this.responses[existingId] = Object.assign(this.responses[existingId], fileItem);
        } else {
          // Create new response
          this.responses.push(fileItem);
          console.log(this.responses);
        }
      });
    };

    // Update model on completion of uploading a file
    this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
      upsertResponse(
        {
          file: item.file,
          status,
          data: JSON.parse(response)
        }
      );

    this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => {
      var data = JSON.parse(response).url;
      makePostReq(data, this.larry);
    };
    // Update model on upload progress event
    this.uploader.onProgressItem = (fileItem: any, progress: any) =>
      upsertResponse(
        {
          file: fileItem.file,
          progress,
          data: {}
        }
      );
  }

  // Delete an uploaded image
  // Requires setting "Return delete token" to "Yes" in your upload preset configuration
  // See also https://support.cloudinary.com/hc/en-us/articles/202521132-How-to-delete-an-image-from-the-client-side-
  deleteImage = function (data: any, index: number) {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudinary.config().cloud_name}/delete_by_token`;
    const headers = new Headers({ 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' });
    const options = { headers: headers };
    const body = {
      token: data.delete_token
    };
    this.http.post(url, body, options).subscribe(response => {
      console.log(`Deleted image - ${data.public_id} ${response.result}`);
      // Remove deleted item for responses
      this.responses.splice(index, 1);
    });
  };

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  getFileProperties(fileProperties: any) {
    // Transforms Javascript Object to an iterable to be used by *ngFor
    if (!fileProperties) {
      return null;
    }
    return Object.keys(fileProperties)
      .map((key) => ({ 'key': key, 'value': fileProperties[key] }));
  }

  changeSuccessMessage() {
    this._success.next(`${new Date()} - Message successfully changed.`);
  }

  // MOCK FUNCTION FOR POPULATING TAGS
  createTagButtons() {
    var tagOutput = document.getElementById("tag-output");

    var btnClasses = [
      "btn tag-button btn-sm btn-outline-default",
      "btn tag-button btn-sm btn-outline-primary",
      "btn tag-button btn-sm btn-outline-info",
      "btn tag-button btn-sm btn-outline-success",
      "btn tag-button btn-sm btn-outline-warning",
      "btn tag-button btn-sm btn-outline-danger"
    ];

    //var mockTags = ["#nwhacks","#vancouver","#markzuckerberg","#nwhacks2018","#water","#nosleepteam","#oranges","#apples","#poster","#dafuq"];
    var tagArrLen = (this.tags.length > 30) ? 30 : this.tags.length;

    for (var i = 1, btnClassesLen = btnClasses.length; i < tagArrLen; i++) {
      var newElement = '<button _ngcontent-c3 (click)="tagButtonClicked()" type="button" class="' + btnClasses[i%btnClasses.length] + '">' + '#' + this.tags[i] + '</button>'
      tagOutput.insertAdjacentHTML('beforeend', newElement);
    } 
  }

  tagButtonClicked() {
    console.log("haha");
  }

  copyToClipboard() {
    this.changeSuccessMessage();
  }

}
