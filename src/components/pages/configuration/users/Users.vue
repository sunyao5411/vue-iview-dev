<template>
    <Row type="flex">
        <Col span="20">
        <Row type="flex" style="width: 100%;border-bottom: 1px solid #e9eaec">
            <Col span="16">
            <h1>{{title}}</h1>
            </Col>
            <Col span="8">
            <div style="text-align: right"><Input icon="search" placeholder="Search..."
                                                  style="width: 200px"></Input>
            </div>
            </Col>
        </Row>
        <Row>
                <Col span="24">
                <div style="float: right;">
                    <Page :page-size="query.pageSize" :total="Users.list.data.total" :current="Users.list.data.current" size="small"
                          @on-change="changePage" @on-page-size-change="changePageSizer" show-total
                          show-sizer></Page>
                </div>
                </Col>
                <Col span="24">
                <Table @on-sort-change="sortChange" size="small" :columns="columns" :data="Users.list.data.list"></Table>

                </Col>
                <Col span="24">
                <div style="float: right;">
                    <Page :page-size="query.pageSize" :total="Users.list.data.total" :current="Users.list.data.current" size="small"
                          @on-change="changePage" @on-page-size-change="changePageSizer" show-total
                          show-sizer></Page>
                </div>
                </Col>
        </Row>
        </Col>
        <Col span="4">
        <Card>
            <p slot="title">
                Invite your team
            </p>
            <Button  @click="openModal" style="width:100%; text-align: left" icon="plus" type="success">Add Users</Button>
        </Card>
        <Modal width="600px" v-model="modal" :title="modalTitle"
               :loading="loading"
               @on-ok="saveUsers">
            <DynamicForm :dicts="dicts" :button="{enabled:false}"  ref="form" :fields="fields" :ruleValidate="ruleValidate"
                         :formValidate="formValidate"></DynamicForm>
            <div slot="footer">
                <Button size="large" @click="resetForm">reset</Button>
                <Button type="primary" size="large" :loading="loading" @click="saveUsers">Submit</Button>
            </div>
        </Modal>
        </Col>
    </Row>
</template>
<script>
    import {VueUtil, FormUtil} from '../../../../libs';
    import _ from 'lodash';
    export default {
        components: {
        },
        computed: {
            ...VueUtil(this).select(['Users','Teams']).state(),
        },
        methods: {
            ...VueUtil(this).select(['Users','Teams']).actions(),
            openModal(){
                this.modalTitle = "Add Users";
                this.modal = true;
                this.loading = false;
                VueUtil(this).select('Teams').list();
            },
            saveUsers(){
                this.loading = true;
                this.$refs['form'].validate({
                    ok: (data) => {
                        if(!!data.id)
                            VueUtil(this).select('Users').update(data);
                        else
                            VueUtil(this).select('Users').save(data);
                    }, err: () => {
                        this.loading = false;
                    }
                });
            },
            resetForm(){
                this.$refs['form'].handleReset('formValidate');
            },
            btnClick(){
                this.$router.push(this.addBtn.path);
            },

            deleteUsers(id){
                this.$Modal.confirm({
                    title: 'Confirem',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        VueUtil(this).select('Users').delete(id);
                    }
                });
            },
            updateUsers(user){
                VueUtil(this).select('Users').update(user);
            },
            sortChange({key,order}){
                this.query = {...this.query, sortField:key, sortOrder:order};
                this.changePage();
            },
            changePage(page){
                page ? this.query.current = page : null;
                VueUtil(this).select('Users').list(this.query);
            },
            changePageSizer(pageSize){
                this.query.pageSize = pageSize;
                VueUtil(this).select('Users').list(this.query);
            },
            listenUsers(data){
                if (data.type === 'get') {
                    this.formValidate = data.data;
                    this.openModal();
                } else {
                    if (!data.loading) {
                        if (!!data.error) {
                            this.$Message.error(`${data.type} fail!`);
                            this.loading = data.loading;
                        } else {
                            this.$Message.success(`${data.type} success!`);
                            setTimeout(() => {
                                this.modal = false;
                                this.changePage();
                                this.$refs['form'].handleReset('formValidate').resetFields();
                            }, 600);
                        }
                    }
                }
            },
            listenTeams(data){
                if (!data.loading) {
                    if (!data.error) {
                        this.dicts.Teams = _.map(data.data, t => {
                            return {value: t.id, label: t.name}
                        });
                    }
                }
            },
            operate(id){
                var $id = id.split("/");
                switch ($id[0]){
                    case 'view':
                        this.$router.push(`/users/${$id[1]}`);
                        break;
                    case 'edit':
                        VueUtil(this).select('Users').get(_.parseInt($id[1]));
                        break;
                    case 'delete':
                        this.deleteUsers(_.parseInt($id[1]));
                        break;
                }
            }
        },
        watch: {
            'Users.get': 'listenUsers',
            'Users.delete': 'listenUsers',
            'Users.save': 'listenUsers',
            'Users.update': 'listenUsers',
            'Teams.list': 'listenTeams',
        },
        // 挂载完毕请求数据
        mounted(){
            this.changePage(1);
        },
        data(){
            const fields = [
                {
                    label: 'User',
                    id: 'name',
                    type:'input',
                    sortable:'custom',
                    rules:[{required:true}],
                    span:22,
                }, {
                    label: 'Email',
                    id: 'Email',
                    type:'input',
                    sortable:'custom',
                    span:22,
                }, {
                    label: 'Job Title',
                    id: 'jobTitle',
                    type:'input',
                    sortable:'custom',
                    span:22,
                }, {
                    label: 'Base Role',
                    id: 'baseRole',
                    type:'select',
                    options:'roles',
                    sortable:'custom',
                    span:22,
                }, {
                    label: 'Teams',
                    id: 'teams',
                    type:'select',
                    options:'Teams',
                    filterable: true,
                    sortable:'custom',
                    span:22,
                }
            ];
            const formUtil = FormUtil(this);
            formUtil.fields(fields);
            const query = formUtil.defaultQuery();
            const rowMenuList = [
                {title:"view",icon:"search",type:'view'},
                {title:"edit",icon:"edit",type:'edit'},
                {title:"delete",icon:"trash-a",type:'delete'},
            ]
            const dicts ={
                Roles:[],
                Teams:[],
            }
            return {
                query,
                dicts,
                modal:false,
                loading: false,
                modalTitle:'',
                title: 'Users on My Teams',
                tab: 'Users',
                addBtn: {title: "Add New Users", path: '/service_add',},
                fields: formUtil.fields(),
                queryFields: formUtil.queryFields(),
                formValidate: formUtil.forms(),
                ruleValidate: formUtil.rules(),
                columns: [
                    ...formUtil.columns(),
                    {
                        key: 'id',
                        render: (h, params) => {
                            return ( <DropMenuDecorator id={params.row.id} select={this.operate} title='Operate' list={rowMenuList}></DropMenuDecorator>);
                        }
                    }
                ],

            }
        }
    }
</script>