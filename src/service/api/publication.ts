import { request } from '../request';
import { 
  getPublications as getPublicationsFromSupabase,
  insertPublication as insertPublicationToSupabase,
  updatePublication as updatePublicationInSupabase,
  deletePublication as deletePublicationFromSupabase,
  getPublicationById as getPublicationByIdFromSupabase
} from '@/supabase/supabaseAction';

/** Get publication list */
export function fetchPublicationList(): Promise<Api.Publication.PublicationItem[]> {
  return getPublicationsFromSupabase();
}

/** Get publication by id */
export function fetchPublicationById(id: string): Promise<Api.Publication.PublicationItem[]> {
  return getPublicationByIdFromSupabase(id);
}

/** Create publication */
export function createPublication(data: Api.Publication.CreatePublicationRequest): Promise<any> {
  return insertPublicationToSupabase(data);
}

/** Update publication */
export function updatePublication(id: string, data: Partial<Api.Publication.CreatePublicationRequest>): Promise<any> {
  return updatePublicationInSupabase(id, data);
}

/** Delete publication */
export function deletePublication(id: string): Promise<any> {
  return deletePublicationFromSupabase(id);
}

/** Search publications */
export function searchPublications(keyword: string): Promise<Api.Publication.PublicationItem[]> {
  // 这里可以实现更复杂的搜索逻辑
  return getPublicationsFromSupabase().then(data => {
    if (!keyword || !data) return data || [];
    return data.filter(item => 
      item.title.includes(keyword) || 
      item.content.includes(keyword) ||
      item.tag.includes(keyword)
    );
  });
} 