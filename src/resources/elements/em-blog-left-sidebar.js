import { bindable, containerless } from 'aurelia-framework';

@containerless
export class EmBlogLeftSidebar {

    @bindable value;

    valueChanged(newValue, oldValue) {

    }

    /**
     * 构造函数
     */
    constructor() {
        this.subscribe = ea.subscribe(nsCons.EVENT_BLOG_CHANGED, (payload) => {
            if (payload.action == 'created') {
                this.blogs = [payload.blog, ...this.blogs];
            } else if (payload.action == 'updated') {
                _.extend(_.find(this.blogs, { id: payload.blog.id }), payload.blog);
            }
        });
    }

    /**
     * 当数据绑定引擎从视图解除绑定时被调用
     */
    unbind() {
        this.subscribe.dispose();
    }

    /**
     * 当视图被附加到DOM中时被调用
     */
    attached() {

        this.getBlogTree();

    }

    getBlogTree() {
        $.get('/admin/blog/list', {
            page: 0,
            size: 10000
        }, (data) => {
            if (data.success) {
                this.blogs = data.data.content;
                this.blog = _.find(this.blogs, { id: nsCtx.blogId });
            }
        });
    }
}
