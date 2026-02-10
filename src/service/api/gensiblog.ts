import { request } from '../request';
import { 
  getGensiblogList as getGensiblogListFromSupabase,
  insertGensiblog as insertGensiblogToSupabase,
  updateGensiblog as updateGensiblogInSupabase,
  deleteGensiblog as deleteGensiblogFromSupabase,
  getGensiblogById as getGensiblogByIdFromSupabase,
  insertBlogComment as insertBlogCommentToSupabase,
  getBlogCommentsByBlogId as getBlogCommentsByBlogIdFromSupabase,
  getAllBlogComments as getAllBlogCommentsFromSupabase,
  updateBlogComment as updateBlogCommentInSupabase,
  deleteBlogComment as deleteBlogCommentFromSupabase
} from '@/supabase/supabaseAction';

/** Get gensiblog list */
export function fetchGensiblogList(): Promise<Api.Gensiblog.GensiblogItem[]> {
  return getGensiblogListFromSupabase();
}

/** Get gensiblog by id */
export function fetchGensiblogById(id: string): Promise<Api.Gensiblog.GensiblogItem[]> {
  return getGensiblogByIdFromSupabase(id);
}

/** Create gensiblog */
export function createGensiblog(data: Api.Gensiblog.CreateGensiblogRequest): Promise<any> {
  return insertGensiblogToSupabase(data);
}

/** Update gensiblog */
export function updateGensiblog(id: string, data: Partial<Api.Gensiblog.CreateGensiblogRequest>): Promise<any> {
  return updateGensiblogInSupabase(id, data);
}

/** Delete gensiblog */
export function deleteGensiblog(id: string): Promise<any> {
  return deleteGensiblogFromSupabase(id);
}

/** Search gensiblog */
export function searchGensiblog(keyword: string): Promise<Api.Gensiblog.GensiblogItem[]> {
  return getGensiblogListFromSupabase().then(data => {
    if (!keyword || !data) return data || [];
    return data.filter(item => 
      item.title?.includes(keyword) || 
      item.subtitle?.includes(keyword) ||
      item.author?.includes(keyword) ||
      item.content?.includes(keyword)
    );
  });
}

// ============ 博客评论 API ============

/** 提交新评论 */
export function submitBlogComment(data: Api.BlogComment.CreateBlogCommentRequest): Promise<any> {
  return insertBlogCommentToSupabase({
    ...data,
    state: 1,  // 新评论默认为待审核状态
    sort: 0
  });
}

/** 根据博客ID获取已审核的评论列表（最多10条） */
export function fetchBlogCommentsByBlogId(blogId: string): Promise<Api.BlogComment.BlogCommentItem[]> {
  return getBlogCommentsByBlogIdFromSupabase(blogId);
}

/** 获取所有评论（后台管理用） */
export function fetchAllBlogComments(): Promise<Api.BlogComment.BlogCommentItem[]> {
  return getAllBlogCommentsFromSupabase();
}

/** 更新评论（后台管理用） */
export function updateBlogComment(id: string, data: Partial<Api.BlogComment.UpdateBlogCommentRequest>): Promise<any> {
  return updateBlogCommentInSupabase(id, data);
}

/** 删除评论（后台管理用） */
export function deleteBlogComment(id: string): Promise<any> {
  return deleteBlogCommentFromSupabase(id);
}

