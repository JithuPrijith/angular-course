import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import {
  Form,
  FormControl,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { mimeType } from './mime-type.validators';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  private mode = 'create';
  private postId!: any;
  post!: Post;
  isLoading = false;
  form!: FormGroup;
  imagePreview!: string;
  private authStatusSub! :Subscription;

  constructor(public postService: PostService, public route: ActivatedRoute, private authService : AuthService) {
    // this.post = { id: '', title: '', content: '' };
  }

  ngOnInit(): void {
   this.authStatusSub =  this.authService.getAuthStatusListener().subscribe((authStatus) => {
    this.isLoading = false;
   });
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            id: postData.id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator,
          };
          this.form?.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.form.patchValue({ image: file });
    this.form.get('image')?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file as File);
  }

  onSavePost() {
    if (this.form?.invalid) {
      return;
    }
    if (this.mode === 'create') {
      this.postService.addPosts(
        this.form?.value.title,
        this.form?.value.content,
        this.form.value.image
      );
    } else {
      this.postService.updatePost(
        this.postId,
        this.form?.value.title,
        this.form?.value.content,
        this.form?.value?.image
      );
    }
    this.form?.reset();
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
}
