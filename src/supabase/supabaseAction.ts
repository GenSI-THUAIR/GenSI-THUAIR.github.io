import  supabase  from "./supabase";
import {
   useMessage
} from 'naive-ui';

const $message = useMessage();

// 注意：所有数据库操作现在都使用 anon 角色，无需 token 验证
// 登录状态仅用于前端 UI 显示，不影响数据库权限

//插入新闻
export const insertNews = async (news: any) => {
    const res = await supabase.from('news').insert(news);
    return res.data;
}
//插入信息
export const insertMessages= async (message: any) => {
    const res = await supabase.from('message').insert(message);
    return res.data;
}
//添加信息
export const insertProject= async (project: any) => {
    const res = await supabase.from('project').insert(project);
    return res.data;
}
//添加信息
export const insertMember= async (member: any) => {
    const res = await supabase.from('member').insert(member);
    return res.data;
}

// 获取新闻列表
export const getNews = async () => {
    return await getList('news');
}

// 获取消息列表
export const getMessages = async () => {
    return await getList('message');
}

// 获取项目列表
export const getProjects = async () => {
    return await getList('project');
}

// 获取成员列表
export const getMembers = async () => {
    return await getList('member');
}

// 更新新闻
export const updateNews = async (id: string, params: any) => {
    const res = await updateAction(id, 'news', params);
    return res;
}

// 更新消息
export const updateMessage = async (id: string, params: any) => {
    const res = await updateAction(id, 'message', params);
    return res;
}

// 更新项目
export const updateProject = async (id: string, params: any) => {
    const res = await updateAction(id, 'project', params);
    return res;
}

// 更新成员
export const updateMember = async (id: string, params: any) => {
    const res = await updateAction(id, 'member', params);
    return res;
}

// 删除新闻
export const deleteNews = async (id: string) => {
    const res = await deleteAction(id, 'news');
    return res;
}

// 删除消息
export const deleteMessage = async (id: string) => {
    const res = await deleteAction(id, 'message');
    return res;
}

// 删除项目
export const deleteProject = async (id: string) => {
    const res = await deleteAction(id, 'project');
    return res;
}

// 删除成员
export const deleteMember = async (id: string) => {
    const res = await deleteAction(id, 'member');
    return res;
}

//编辑
export const updateAction = async (id: string,table:string,params:any) => {
    const { data, error } = await supabase.from(table).update(params).eq('id', id);
    return data;
}
//获取列表
export const getList = async (table:string) => {
    const { data, error } = await supabase.from(table).select('*');
    return data;
}
//删除
export const deleteAction = async (id: string,table:string) => {
    const { data, error } = await supabase.from(table).delete().eq('id', id);
    return data;
}
//根据id获取
export const getById = async (id: string,table:string) => {
    const { data, error } = await supabase.from(table).select('*').eq('id', id);
    return data;
}

//添加发布信息
export const insertPublication = async (publication: any) => {
    const res = await supabase.from('publications').insert(publication);
    return res.data;
}

// 获取发布列表
export const getPublications = async () => {
    return await getList('publications');
}

// 更新发布
export const updatePublication = async (id: string, params: any) => {
    const res = await updateAction(id, 'publications', params);
    return res;
}

// 删除发布
export const deletePublication = async (id: string) => {
    const res = await deleteAction(id, 'publications');
    return res;
}

// 根据id获取发布
export const getPublicationById = async (id: string) => {
    return await getById(id, 'publications');
}

//添加关注我们信息
export const insertFollowUs = async (followUs: any) => {
    const res = await supabase.from('followus').insert(followUs);
    return res.data;
}

// 获取关注我们列表
export const getFollowUsList = async () => {
    return await getList('followus');
}

// 更新关注我们
export const updateFollowUs = async (id: string, params: any) => {
    const res = await updateAction(id, 'followus', params);
    return res;
}

// 删除关注我们
export const deleteFollowUs = async (id: string) => {
    const res = await deleteAction(id, 'followus');
    return res;
}

// 根据id获取关注我们
export const getFollowUsById = async (id: string) => {
    return await getById(id, 'followus');
}

//添加博客信息
export const insertBlog = async (blog: any) => {
    const { data, error } = await supabase.from('blog').insert(blog);
    if (error) {
        console.error('插入博客失败:', error);
        throw new Error(error.message || '插入博客失败');
    }
    return data;
}

// 获取博客列表
export const getBlogList = async () => {
    return await getList('blog');
}

// 更新博客
export const updateBlog = async (id: string, params: any) => {
    const res = await updateAction(id, 'blog', params);
    return res;
}

// 删除博客
export const deleteBlog = async (id: string) => {
    const res = await deleteAction(id, 'blog');
    return res;
}

// 根据id获取博客
export const getBlogById = async (id: string) => {
    return await getById(id, 'blog');
}

// 校友相关API
export const insertAlumni = async (alumni: any) => {
    const res = await supabase.from('alumni').insert(alumni);
    return res.data;
}

// 获取校友列表
export const getAlumniList = async () => {
    return await getList('alumni');
}

// 更新校友
export const updateAlumni = async (id: string, params: any) => {
    const res = await updateAction(id, 'alumni', params);
    return res;
}

// 删除校友
export const deleteAlumni = async (id: string) => {
    const res = await deleteAction(id, 'alumni');
    return res;
}

// 根据id获取校友
export const getAlumniById = async (id: string) => {
    return await getById(id, 'alumni');
}

// Gensiblog相关API
export const insertGensiblog = async (gensiblog: any) => {
    const { data, error } = await supabase.from('gensiblog').insert(gensiblog);
    if (error) {
        console.error('插入Gensiblog失败:', error);
        throw new Error(error.message || '插入Gensiblog失败');
    }
    return data;
}

// 获取Gensiblog列表
export const getGensiblogList = async () => {
    return await getList('gensiblog');
}

// 获取可见Gensiblog列表（仅 isshow=1）
export const getVisibleGensiblogList = async () => {
    const { data, error } = await supabase.from('gensiblog').select('*').eq('isshow', 1);
    if (error) {
        console.error('获取可见Gensiblog列表失败:', error);
        return [];
    }
    return data;
}

// 更新Gensiblog
export const updateGensiblog = async (id: string, params: any) => {
    const res = await updateAction(id, 'gensiblog', params);
    return res;
}

// 删除Gensiblog
export const deleteGensiblog = async (id: string) => {
    const res = await deleteAction(id, 'gensiblog');
    return res;
}

// 根据id获取Gensiblog
export const getGensiblogById = async (id: string) => {
    return await getById(id, 'gensiblog');
}

// 根据id删除图片
export const deleteImage = async (id: string | undefined,table:string,column:string) => {
    return  await supabase
    .from(table)
    .update({ [column]: '' })
    .eq('id', id)
    .select()
}

// 公众推文(group)相关API
export const insertGroup = async (group: any) => {
    const res = await supabase.from('group').insert(group);
    return res.data;
}

// 获取公众推文列表
export const getGroupList = async () => {
    return await getList('group');
}

// 更新公众推文
export const updateGroup = async (id: string, params: any) => {
    const res = await updateAction(id, 'group', params);
    return res;
}

// 删除公众推文
export const deleteGroup = async (id: string) => {
    const res = await deleteAction(id, 'group');
    return res;
}

// 根据id获取公众推文
export const getGroupById = async (id: string) => {
    return await getById(id, 'group');
}

// 轮播图(slideshow)相关API
export const insertSlideshow = async (slideshow: any) => {
    const res = await supabase.from('slideshow').insert(slideshow);
    return res.data;
}

// 获取轮播图列表
export const getSlideshowList = async () => {
    const { data, error } = await supabase.from('slideshow').select('*').order('sort', { ascending: false });
    if (error) {
        console.error('Error fetching slideshow list:', error);
        return [];
    }
    return data;
}

// 更新轮播图
export const updateSlideshow = async (id: string, params: any) => {
    const res = await updateAction(id, 'slideshow', params);
    return res;
}

// 删除轮播图
export const deleteSlideshow = async (id: string) => {
    const res = await deleteAction(id, 'slideshow');
    return res;
}

// 根据id获取轮播图
export const getSlideshowById = async (id: string) => {
    return await getById(id, 'slideshow');
}

// 上传博客图片到 Supabase Storage（返回公开URL，避免base64嵌入HTML导致请求过大）
export const uploadBlogImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `gensiblog/${fileName}`;

  const { data, error } = await supabase.storage
    .from('gensi')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('上传图片失败:', error);
    console.error('错误详情:', JSON.stringify(error));
    throw new Error(error.message || '上传图片失败，请检查存储桶 gensi 的访问策略');
  }

  const { data: urlData } = supabase.storage
    .from('gensi')
    .getPublicUrl(filePath);

  console.log('图片上传成功，公开URL:', urlData.publicUrl);
  return urlData.publicUrl;
};

// 博客评论(blogcomment)相关API
export const insertBlogComment = async (comment: any) => {
    const { data, error } = await supabase.from('blogcomment').insert(comment);
    if (error) {
        console.error('插入评论失败:', error);
        throw new Error(error.message || '插入评论失败');
    }
    return data;
}

// 获取博客评论列表（仅获取已审核的评论，按排序和时间排列，最多10条）
export const getBlogCommentsByBlogId = async (blogId: string) => {
    const { data, error } = await supabase
        .from('blogcomment')
        .select('*')
        .eq('blog_id', blogId)
        .eq('state', 1)  // state = 1 表示已审核通过
        .order('sort', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);
    if (error) {
        console.error('获取评论列表失败:', error);
        return [];
    }
    return data;
}

// 获取所有博客评论列表（后台管理用）
export const getAllBlogComments = async (blogId: string) => {
    const { data, error } = await supabase
        .from('blogcomment')
        .select('*')
        .eq('blog_id', blogId)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('获取评论列表失败:', error);
        return [];
    }
    return data;
}

// 更新博客评论
export const updateBlogComment = async (id: string, params: any) => {
    const res = await updateAction(id, 'blogcomment', params);
    return res;
}

// 删除博客评论
export const deleteBlogComment = async (id: string) => {
    const res = await deleteAction(id, 'blogcomment');
    return res;
}


