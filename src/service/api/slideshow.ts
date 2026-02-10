import { request } from '../request';
import { 
  getSlideshowList as getSlideshowListFromSupabase,
  insertSlideshow as insertSlideshowToSupabase,
  updateSlideshow as updateSlideshowInSupabase,
  deleteSlideshow as deleteSlideshowFromSupabase,
  getSlideshowById as getSlideshowByIdFromSupabase
} from '@/supabase/supabaseAction';

/** Get slideshow list */
export function fetchSlideshowList(): Promise<Api.Slideshow.SlideshowItem[]> {
  return getSlideshowListFromSupabase();
}

/** Get slideshow by id */
export function fetchSlideshowById(id: string): Promise<Api.Slideshow.SlideshowItem[]> {
  return getSlideshowByIdFromSupabase(id);
}

/** Create slideshow */
export function createSlideshow(data: Api.Slideshow.CreateSlideshowRequest): Promise<any> {
  return insertSlideshowToSupabase(data);
}

/** Update slideshow */
export function updateSlideshow(id: string, data: Partial<Api.Slideshow.CreateSlideshowRequest>): Promise<any> {
  return updateSlideshowInSupabase(id, data);
}

/** Delete slideshow */
export function deleteSlideshow(id: string): Promise<any> {
  return deleteSlideshowFromSupabase(id);
}

/** Search slideshows */
export function searchSlideshows(keyword: string): Promise<Api.Slideshow.SlideshowItem[]> {
  // 这里可以实现更复杂的搜索逻辑
  return getSlideshowListFromSupabase().then(data => {
    if (!keyword || !data) return data || [];
    return data.filter(item => 
      item.description.includes(keyword) || 
      item.description_cn.includes(keyword) ||
      item.link_url.includes(keyword)
    );
  });
}
