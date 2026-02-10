import { request } from '../request';
import { 
  getFollowUsList as getFollowUsListFromSupabase,
  insertFollowUs as insertFollowUsToSupabase,
  updateFollowUs as updateFollowUsInSupabase,
  deleteFollowUs as deleteFollowUsFromSupabase,
  getFollowUsById as getFollowUsByIdFromSupabase
} from '@/supabase/supabaseAction';

/** Get followus list */
export function fetchFollowUsList(): Promise<Api.FollowUs.FollowUsItem[]> {
  return getFollowUsListFromSupabase().then(data => data || []);
}

/** Get followus by id */
export function fetchFollowUsById(id: string): Promise<Api.FollowUs.FollowUsItem[]> {
  return getFollowUsByIdFromSupabase(id).then(data => data || []);
}

/** Create followus */
export function createFollowUs(data: Api.FollowUs.CreateFollowUsRequest): Promise<any> {
  return insertFollowUsToSupabase(data);
}

/** Update followus */
export function updateFollowUs(id: string, data: Partial<Api.FollowUs.CreateFollowUsRequest>): Promise<any> {
  return updateFollowUsInSupabase(id, data);
}

/** Delete followus */
export function deleteFollowUs(id: string): Promise<any> {
  return deleteFollowUsFromSupabase(id);
}

/** Search followus */
export function searchFollowUs(keyword: string): Promise<Api.FollowUs.FollowUsItem[]> {
  // 这里可以实现更复杂的搜索逻辑
  return getFollowUsListFromSupabase().then(data => {
    if (!keyword || !data) return data || [];
    return data.filter(item => 
      item.content.includes(keyword) ||
      (item.time && item.time.includes(keyword)) ||
      (item.link && item.link.includes(keyword))
    );
  });
} 