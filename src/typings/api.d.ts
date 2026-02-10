/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common params of paginating */
    interface PaginatingCommonParams {
      /** current page number */
      current: number;
      /** page size */
      size: number;
      /** total count */
      total: number;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      records: T[];
    }

    /** common search params of table */
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /**
     * enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = '1' | '2';

    /** common record */
    type CommonRecord<T = any> = {
      /** record id */
      id: number;
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
      /** record status */
      status: EnableStatus | null;
    } & T;
  }

  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken?: string;
    }

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
    }
  }

  /**
   * namespace Route
   *
   * backend api module: "route"
   */
  namespace Route {
    type ElegantConstRoute = import('@elegant-router/types').ElegantConstRoute;

    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    interface UserRoute {
      routes: MenuRoute[];
      home: import('@elegant-router/types').LastLevelRouteKey;
    }
  }

  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /** role */
    type Role = Common.CommonRecord<{
      /** role name */
      roleName: string;
      /** role code */
      roleCode: string;
      /** role description */
      roleDesc: string;
    }>;

    /** role search params */
    type RoleSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'status'> & CommonSearchParams
    >;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** all role */
    type AllRole = Pick<Role, 'id' | 'roleName' | 'roleCode'>;

    /**
     * user gender
     *
     * - "1": "male"
     * - "2": "female"
     */
    type UserGender = '1' | '2';

    /** user */
    type User = Common.CommonRecord<{
      /** user name */
      userName: string;
      /** user gender */
      userGender: UserGender | null;
      /** user nick name */
      nickName: string;
      /** user phone */
      userPhone: string;
      /** user email */
      userEmail: string;
      /** user role code collection */
      userRoles: string[];
    }>;

    /** user search params */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.User, 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'status'> &
        CommonSearchParams
    >;

    /** user list */
    type UserList = Common.PaginatingQueryRecord<User>;

    /**
     * menu type
     *
     * - "1": directory
     * - "2": menu
     */
    type MenuType = '1' | '2';

    type MenuButton = {
      /**
       * button code
       *
       * it can be used to control the button permission
       */
      code: string;
      /** button description */
      desc: string;
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = '1' | '2';

    type MenuPropsOfRoute = Pick<
      import('vue-router').RouteMeta,
      | 'i18nKey'
      | 'keepAlive'
      | 'constant'
      | 'order'
      | 'href'
      | 'hideInMenu'
      | 'activeMenu'
      | 'multiTab'
      | 'fixedIndexInTab'
      | 'query'
    >;

    type Menu = Common.CommonRecord<{
      /** parent menu id */
      parentId: number;
      /** menu type */
      menuType: MenuType;
      /** menu name */
      menuName: string;
      /** route name */
      routeName: string;
      /** route path */
      routePath: string;
      /** component */
      component?: string;
      /** iconify icon name or local icon name */
      icon: string;
      /** icon type */
      iconType: IconType;
      /** buttons */
      buttons?: MenuButton[] | null;
      /** children menu */
      children?: Menu[] | null;
    }> &
      MenuPropsOfRoute;

    /** menu list */
    type MenuList = Common.PaginatingQueryRecord<Menu>;

    type MenuTree = {
      id: number;
      label: string;
      pId: number;
      children?: MenuTree[];
    };
  }

  /** Publication related types */
  namespace Publication {
    /** Publication item */
    interface PublicationItem {
      id: string;
      title: string;
      content: string;
      cover: string;
      tag: string;
      date: string;
      link_url?: string; // 文章链接
      author?: string; // 作者
      booktitle?: string; // 书籍标题/会议名称
      code_url?: string; // 代码链接
      bib?: string; // 参考文献引用
      sort?: number; // 排序字段
      meeting?: string; // 来源会议
      year?: string; // 年份
      created_at?: string;
    }

    /** Publication create request */
    interface CreatePublicationRequest {
      title: string;
      content: string;
      cover?: string;
      tag?: string;
      date?: string;
      link_url?: string; // 文章链接
      author?: string; // 作者
      booktitle?: string; // 书籍标题/会议名称
      code_url?: string; // 代码链接
      bib?: string; // 参考文献引用
      sort?: number; // 排序字段
      meeting?: string; // 来源会议
      year?: string; // 年份
    }

    /** Publication update request */
    interface UpdatePublicationRequest extends Partial<CreatePublicationRequest> {
      id: string;
    }

    /** Publication list response */
    interface PublicationListResponse {
      data: PublicationItem[];
      total: number;
    }
  }

  /** News related types */
  namespace News {
    /** News item */
    interface NewsItem {
      id: string;
      title: string;
      title_cn?: string;
      content: string;
      content_cn?: string;
      cover?: string;
      news_link?: string;
      time?: string;
      created_by: string;
      views: number;
      create_time: string;
      lbtcontent?: string;
      lbtcontent_cn?: string;
    }

    /** News create request */
    interface CreateNewsRequest {
      title: string;
      title_cn?: string;
      content: string;
      content_cn?: string;
      cover?: string;
      news_link?: string;
      time?: string;
      created_by: string;
      views?: number;
      lbtcontent?: string;
      lbtcontent_cn?: string;
    }

    /** News update request */
    interface UpdateNewsRequest extends Partial<CreateNewsRequest> {
      id: string;
    }

    /** News list response */
    interface NewsListResponse {
      data: NewsItem[];
      total: number;
    }
  }

  /** Project related types */
  namespace Project {
    /** Project item */
    interface ProjectItem {
      id: string;
      title: string;
      cover: string;
      description: string;
      description_cn?: string;
      views: number;
      link_url?: string;
      created_at?: string;
      lbtcontent?: string;
      lbtcontent_cn?: string;
    }

    /** Project create request */
    interface CreateProjectRequest {
      title: string;
      cover?: string;
      description: string;
      description_cn?: string;
      views?: number;
      link_url?: string;
      lbtcontent?: string;
      lbtcontent_cn?: string;
    }

    /** Project update request */
    interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
      id: string;
    }

    /** Project list response */
    interface ProjectListResponse {
      data: ProjectItem[];
      total: number;
    }
  }

  /** FollowUs related types */
  namespace FollowUs {
    /** FollowUs item */
    interface FollowUsItem {
      id: string;
      media: string;      // 社交媒体
      title: string;      // 标题
      content: string;    // 内容
      content_cn?: string; // 中文内容
      time: string;       // 发布时间
      cover: string;      // 图片
      link: string;       // 链接
      created_at?: string;
    }

    /** FollowUs create request */
    interface CreateFollowUsRequest {
      media?: string;
      title?: string;
      content: string;
      content_cn?: string;
      time?: string;
      cover?: string;
      link?: string;
    }

    /** FollowUs update request */
    interface UpdateFollowUsRequest extends Partial<CreateFollowUsRequest> {
      id: string;
    }

    /** FollowUs list response */
    interface FollowUsListResponse {
      data: FollowUsItem[];
      total: number;
    }
  }

  /** Slideshow related types */
  namespace Slideshow {
    /** Slideshow item */
    interface SlideshowItem {
      id: string;
      cover: string;           // 封面图片
      description: string;     // 描述（英文）
      description_cn: string;  // 描述（中文）
      title?: string;          // 标题（英文）- 可选字段，用于向后兼容
      title_cn?: string;       // 标题（中文）- 可选字段，用于向后兼容
      link_url: string;        // 链接地址
      sort?: number;           // 排序值
      created_at?: string;     // 创建时间
    }

    /** Slideshow create request */
    interface CreateSlideshowRequest {
      cover: string;
      title?: string;
      title_cn?: string;
      description: string;
      description_cn: string;
      link_url: string;
      sort?: number;
    }

    /** Slideshow update request */
    interface UpdateSlideshowRequest extends Partial<CreateSlideshowRequest> {
      id: string;
    }

    /** Slideshow list response */
    interface SlideshowListResponse {
      data: SlideshowItem[];
      total: number;
    }
  }

  /** Blog related types */
  namespace Blog {
    /** Blog item */
    interface BlogItem {
      id: string;
      title: string;      // 英文标题
      title_cn?: string;  // 中文标题
      content: string;    // 内容
      cover: string;      // 封面
      create_by: string;  // 创建者
      time: string;       // 时间
      link_url?: string;  // 外部链接
      type?: string;      // 分区类型：五分钟系列/根思深度系列
      created_at?: string;
    }

    /** Blog create request */
    interface CreateBlogRequest {
      title: string;
      title_cn?: string;  // 中文标题
      content: string;
      cover?: string;
      create_by?: string;
      time?: string;
      link_url?: string;  // 外部链接
      type?: string;      // 分区类型
    }

    /** Blog update request */
    interface UpdateBlogRequest extends Partial<CreateBlogRequest> {
      id: string;
    }

    /** Blog list response */
    interface BlogListResponse {
      data: BlogItem[];
      total: number;
    }

    // 校友相关类型定义
    interface AlumniItem {
      id: string;
      name: string;        // 英文姓名
      name_cn?: string;    // 中文姓名
      describe: string;    // 英文简介
      describe_cn?: string; // 中文简介
      created_at?: string; // 创建时间
    }

    interface CreateAlumniRequest {
      name: string;
      name_cn?: string;
      describe: string;
      describe_cn?: string;
    }

    interface UpdateAlumniRequest extends Partial<CreateAlumniRequest> {
      id: string;
    }

    interface AlumniListResponse {
      data: AlumniItem[];
      total: number;
    }
  }

  /** Gensiblog related types */
  namespace Gensiblog {
    /** Gensiblog item */
    interface GensiblogItem {
      id: string;
      title?: string;           // 标题
      subtitle?: string;        // 副标题
      author?: string;          // 作者
      affiliations?: string;    // 机构
      publish_time?: string;    // 发布时间
      team?: string;            // 团队
      affiliations_des?: string; // 所属单位描述
      citation?: string;        // 引用
      references?: string;      // 参考文献
      content?: string;         // 内容
      introducing?: string;     // 介绍
      github_link?: string;     // GitHub链接
      github_text?: string;     // GitHub显示文字
      huggingface_link?: string; // Hugging Face链接
      hug_text?: string;        // HuggingFace显示文字
      tags?: string;            // 标签（逗号分隔的字符串）
      readtime?: string;        // 阅读时间
      paper_link?: string;      // 论文链接
      paper_text?: string;      // 论文显示文字
      page?: string;            // Page链接
      page_text?: string;       // Page显示文字
      model?: string;           // Model链接
      model_text?: string;      // Model显示文字
      introduction_label?: string;  // Introduction区域自定义标签
      content_label?: string;       // Content区域自定义标签
      reference_label?: string;     // Reference区域自定义标签
      citation_label?: string;      // Citation区域自定义标签
      created_at?: string;      // 创建时间
    }

    /** Gensiblog create request */
    interface CreateGensiblogRequest {
      title?: string;
      subtitle?: string;
      author?: string;
      affiliations?: string;
      publish_time?: string;
      team?: string;
      affiliations_des?: string;
      citation?: string;
      references?: string;
      content?: string;
      introducing?: string;
      github_link?: string;
      github_text?: string;
      huggingface_link?: string;
      hug_text?: string;
      tags?: string;
      readtime?: string;
      paper_link?: string;
      paper_text?: string;
      page?: string;
      page_text?: string;
      model?: string;
      model_text?: string;
      introduction_label?: string;
      content_label?: string;
      reference_label?: string;
      citation_label?: string;
    }

    /** Gensiblog update request */
    interface UpdateGensiblogRequest extends Partial<CreateGensiblogRequest> {
      id: string;
    }

    /** Gensiblog list response */
    interface GensiblogListResponse {
      data: GensiblogItem[];
      total: number;
    }
  }

  /** BlogComment related types */
  namespace BlogComment {
    /** BlogComment item */
    interface BlogCommentItem {
      id: number;
      created_at: string;
      content: string;
      state: number;      // 0: 待审核, 1: 已通过, 2: 已拒绝
      sort: number;
      blog_id: string;
    }

    /** BlogComment create request */
    interface CreateBlogCommentRequest {
      content: string;
      blog_id: string;
      state?: number;
      sort?: number;
    }

    /** BlogComment update request */
    interface UpdateBlogCommentRequest {
      id: number;
      state?: number;
      sort?: number;
      content?: string;
    }
  }
}
