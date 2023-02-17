import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { map, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const backendUrl  = environment.apiUrl+"/posts/"

@Injectable({ providedIn: 'root' })

export class PostService {
  private posts: Post[] = []; //can't update from outside
  private postUpdated = new Subject<{ posts: Post[]; postCount: number }>();
  

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(pageSize: number, page: number) {
    const queryParams = `?pagesize=${pageSize}&page=${page}`;
    this.http
      .get<{ message: string; posts: []; maxpost: number }>(
        backendUrl + queryParams
      )
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post: any) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            maxPosts: postData.maxpost,
          };
        })
      )
      .subscribe((transformedPostData: any) => {
        this.posts = transformedPostData.posts;
        this.postUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts,
        });
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
      creator: string;
    }>(backendUrl+ id);
  }

  addPosts(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http
      .post<{ message: string; post: Post }>(
        backendUrl,
        postData
      )
      .subscribe((res) => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    if (confirm('Do you want to delete the post') == true) {
      return this.http.delete<any>(`${backendUrl+postId}`);
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
        creator: '',
      };
    }
    this.http
      .put(backendUrl + id, postData)
      .subscribe((res: any) => {
        this.router.navigate(['/']);
      });
  }
}
