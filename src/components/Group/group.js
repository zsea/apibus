
import React from 'react';
import { bus } from '../../common/apibus'
import { Table, Button, Icon, Modal, Form, Input, Divider, Popconfirm, Radio } from 'antd';
const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 }
};
const GroupForm = Form.create()(class extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({ visible: true, confirmLoading: false, initValue: {} }, props);
        this.onOk = this.onOk.bind(this);
        this.completed = this.completed.bind(this);
    }
    async completed(success) {
        this.setState({
            confirmLoading: false
        });
        if (success) {
            this.setState({
                visible: false
            });
        }
    }
    async onOk() {
        const { validateFields } = this.props.form;
        let values = await new Promise(function (resolve, reject) {
            validateFields(function (errors, value) {
                if (errors) {
                    resolve();
                }
                else {
                    resolve(value);
                }
            })
        });
        if (!values) return;
        this.setState({
            confirmLoading: true
        });
        this.state.onOk && this.state.onOk(values, this.completed);
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        return <Modal
            title={this.state.title}
            visible={this.state.visible}
            onCancel={() => {
                this.setState({ visible: false });
                this.state.onCancel && this.state.onCancel();
            }}
            maskClosable={false}
            onOk={this.onOk}
            confirmLoading={this.state.confirmLoading}
        >
            <Form>
                <Form.Item {...formItemLayout} label="分组名称">
                    {getFieldDecorator('name', {
                        rules: [{
                            required: true,
                            message: '请填写分组名称。',
                        }],
                        initialValue: this.state.initValue["name"]
                    })(
                        <Input placeholder="" />
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="处理器">
                    {getFieldDecorator('default_url', {
                        rules: [{
                            required: true,
                            message: '请填写处理器。'
                        }, {
                            type: "string",
                            pattern: /^http(s{0,1}):\/\//ig,
                            message: '不是有效的网址格式。'
                        }],
                        initialValue: this.state.initValue["default_url"]
                    })(
                        <Input placeholder="" />
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="文档">
                    {getFieldDecorator('doc_mode', {
                        rules: [],
                        initialValue: this.state.initValue["doc_mode"] || "public"
                    })(
                        <Radio.Group>
                            <Radio value="public">公开</Radio>
                            <Radio value="private">不开公</Radio>
                        </Radio.Group>
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="描述">
                    {getFieldDecorator('desc', {
                        rules: [],
                        initialValue: this.state.initValue["desc"]
                    })(
                        <Input.TextArea rows={6} />
                    )}
                </Form.Item>
            </Form>
        </Modal>
    }
});
const size = 10;
class Group extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            groups: [],
            loading: false
        }

        this.onTitle = this.onTitle.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.Load = this.Load.bind(this);
    }
    currentData = { pagination: { current: 1 }, filters: {}, sorter: {} }
    async Load(pagination, filters, sorter) {
        this.currentData = {
            pagination: pagination,
            filters: filters,
            sorter: sorter
        }
        let page = pagination.current;
        this.setState({ loading: true });
        let response = await bus.Execute("apibus.groups.get", {
            page: page,
            size: size
        });
        this.setState({ loading: false });
        if (response.error_response) {
            Modal.error({
                title: "错误",
                content: response.error_response.sub_msg || response.error_response.msg || "系统错误。"
                , okText: "确定"
            });
            return
        }
        this.setState({ groups: response.groups, total: response.total });
    }
    componentDidMount() {
        this.Load({ current: 1 }, {}, {});
    }
    onTitle() {
        return <div><Button.Group size="large">
            <Button onClick={() => {
                this.Load(this.currentData.pagination, this.currentData.filters, this.currentData.sorter);
            }}>
                <Icon type="reload" />
                刷新
        </Button>
            <Button type="primary" onClick={() => {
                this.setState({
                    form: <GroupForm title="添加分组" onCancel={() => {
                        this.setState({ form: null })
                    }} onOk={async (values, completed) => {
                        //this.setState({loading:true});
                        let response = await bus.Execute("apibus.groups.add", {
                            name: values["name"],
                            default_url: values["default_url"],
                            desc: values["desc"],
                            doc_mode: values["doc_mode"]
                        });
                        //this.setState({ loading: false });
                        if (response.error_response) {
                            Modal.error({
                                title: "错误",
                                content: response.error_response.sub_msg || response.error_response.msg || "系统错误。"
                                , okText: "确定"
                            });
                            completed(false);
                            return
                        }
                        let groups = this.state.groups;
                        groups.unshift(response);
                        this.setState({ groups: groups, form: null });
                        completed(true);
                    }} />
                });
            }}>
                添加
            <Icon type="plus" />
            </Button>
        </Button.Group></div>
    }
    render() {
        return <div>
            {this.state.form}
            <Table
                title={this.onTitle}
                dataSource={this.state.groups}
                loading={this.state.loading}
                rowKey="id"
                onChange={this.Load}
                pagination={{
                    pageSize: size,
                    total: this.state.total,
                    showTotal: (total, range) => `共有数据${total}条。`
                }}
            >
                <Table.Column title="##" key="id" dataIndex="id" />
                <Table.Column title="名称" key="name" dataIndex="name" />
                <Table.Column title="默认处理器" key="default_url" dataIndex="default_url" />
                <Table.Column title="文档" key="doc_mode" dataIndex="doc_mode"
                    render={(d) => d == "public" ? <span style={{ color: "green" }}><Icon type="unlock" />公开</span> : <span style={{ color: "red" }}><Icon type="lock" />不公开</span>}
                />
                <Table.Column title="描述" key="desc" dataIndex="desc" />
                <Table.Column title="操作" key="action" dataIndex="action"
                    render={(act, row, _index) => {
                        return <span>
                            <Popconfirm
                                placement="topRight" title={`你确定要删除分组【${row.name}】吗？`} onConfirm={async () => {
                                    this.setState({ loading: true });
                                    let response = await bus.Execute("apibus.groups.del", {
                                        groupid: row.id
                                    });
                                    this.setState({ loading: false });
                                    if (response.error_response) {
                                        Modal.error({
                                            title: "错误",
                                            content: response.error_response.sub_msg || response.error_response.msg || "系统错误。"
                                            , okText: "确定"
                                        });
                                        return
                                    }
                                    let groups = this.state.groups;
                                    groups.splice(_index, 1);
                                    this.setState({ groups: groups });
                                }} okText="确定" cancelText="取消"
                            ><a href="#">删除</a></Popconfirm>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => {
                                this.setState({
                                    form: <GroupForm title={`编辑分组:${row.name}`} initValue={{
                                        name: row.name,
                                        default_url: row.default_url,
                                        desc: row.desc,
                                        doc_mode: row.doc_mode
                                    }} onCancel={() => {
                                        this.setState({ form: null })
                                    }} onOk={async (values, completed) => {
                                        //this.setState({loading:true});
                                        let response = await bus.Execute("apibus.groups.update", {
                                            name: values["name"],
                                            default_url: values["default_url"],
                                            desc: values["desc"],
                                            doc_mode: values["doc_mode"],
                                            groupid: row.id
                                        });
                                        //this.setState({ loading: false });
                                        if (response.error_response) {
                                            Modal.error({
                                                title: "错误",
                                                content: response.error_response.sub_msg || response.error_response.msg || "系统错误。"
                                                , okText: "确定"
                                            });
                                            completed(false);
                                            return
                                        }
                                        let groups = this.state.groups;
                                        groups[_index] = response;
                                        this.setState({ groups: groups, form: null });
                                        completed(true);
                                    }} />
                                });
                            }}>编辑</a>
                        </span>
                    }}
                />
            </Table></div>
    }
}
export default Group;