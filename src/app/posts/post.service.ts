import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { map, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PostService {
  private posts: Post[] = []; //can't update from outside
  private postUpdated = new Subject<{posts :Post[], postCount : number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(pageSize:number, page :number) {
    const queryParams = `?pagesize=${pageSize}&page=${page}`;
    this.http
      .get<{message: string,posts :[], maxpost:number}>('http://localhost:3000/api/posts'+ queryParams)
      .pipe(
        map((postData) => {
          return {
            posts : postData.posts.map((post: any) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
              };
            }),
            maxPosts : postData.maxpost
          }
          
        })
      )
      .subscribe((transformedPostData: any) => {
        this.posts = transformedPostData.posts
        this.postUpdated.next({posts: [...this.posts], postCount : transformedPostData.maxPosts});
        
      });
  }

  getPostUpdateListener() {
    return this.postUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      id: string;
      title: string;
      content: string;
      imagePath: string;
    }>('http://localhost:3000/api/posts/' + id);
  }

  addPosts(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe((res) => {
        this.router.navigate(['/']);
      })
    
  }

  deletePost(postId: string) {
    if (confirm('Do you want to delete the post') == true) {
    return  this.http
        .delete<any>(`http://localhost:3000/api/posts/${postId}`)
    } else {
      return;
    }
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData!: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else if (typeof image === 'string') {
       postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
      };
    }
    this.http
      .put('http://localhost:3000/api/posts/' + id, postData)
      .subscribe((res: any) => {
        this.router.navigate(['/']);
      });
  }
}
