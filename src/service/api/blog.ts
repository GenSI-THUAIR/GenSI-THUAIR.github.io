import { request } from '../request';
import { 
  getBlogList as getBlogListFromSupabase,
  insertBlog as insertBlogToSupabase,
  updateBlog as updateBlogInSupabase,
  deleteBlog as deleteBlogFromSupabase,
  getBlogById as getBlogByIdFromSupabase
} from '@/supabase/supabaseAction';

/** Get blog list */
export function fetchBlogList(): Promise<Api.Blog.BlogItem[]> {
  return getBlogListFromSupabase();
}

/** Get blog by id */
export function fetchBlogById(id: string): Promise<Api.Blog.BlogItem[]> {
  return getBlogByIdFromSupabase(id);
}

/** Create blog */
export function createBlog(data: Api.Blog.CreateBlogRequest): Promise<any> {
  return insertBlogToSupabase(data);
}

/** Update blog */
export function updateBlog(id: string, data: Partial<Api.Blog.CreateBlogRequest>): Promise<any> {
  return updateBlogInSupabase(id, data);
}

/** Delete blog */
export function deleteBlog(id: string): Promise<any> {
  return deleteBlogFromSupabase(id);
}

/** Search blog */
export function searchBlog(keyword: string): Promise<Api.Blog.BlogItem[]> {
  // 这里可以实现更复杂的搜索逻辑
  return getBlogListFromSupabase().then(data => {
    if (!keyword || !data) return data || [];
    return data.filter(item => 
      item.title.includes(keyword) || 
      item.content.includes(keyword) ||
      item.create_by.includes(keyword)
    );
  });
} 