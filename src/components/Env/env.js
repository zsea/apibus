
import React from 'react';
import { bus } from '../../common/apibus'
import { Table, Button, Icon, Modal, Form, Input, Divider, Popconfirm } from 'antd';
const size = 10;
const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 }
};
const EnvForm = Form.create()(class extends React.Component {
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
                <Form.Item {...formItemLayout} label="环境名称">
                    {getFieldDecorator('name', {
                        rules: [{
                            required: true,
                            message: '请填写环境名称。',
                        }],
                        initialValue: this.state.initValue["name"]
                    })(
                        <Input placeholder="" />
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="调用地址">
                    {getFieldDecorator('url', {
                        rules: [{
                            required: true,
                            message: '请填写调用地址。'
                        }, {
                            type: "url",
                            message: '不是有效的网址格式。'
                        }],
                        initialValue: this.state.initValue["url"]
                    })(
                        <Input placeholder="" />
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
class Env extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            envs: [],
            loading: false,
            form: null
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
        let response = await bus.Execute("apibus.envs.get", {
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
        this.setState({ envs: response.envs, total: response.total });
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
                    form: <EnvForm title="添加环境" onCancel={() => {
                        this.setState({ form: null })
                    }} onOk={async (values, completed) => {
                        //this.setState({loading:true});
                        let response = await bus.Execute("apibus.envs.add", {
                            name: values["name"],
                            url: values["url"],
                            desc: values["desc"]
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
                        let envs = this.state.envs;
                        envs.unshift(response);
                        this.setState({ envs: envs, form: null });
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
                dataSource={this.state.envs}
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
                <Table.Column title="URL" key="url" dataIndex="url" />
                <Table.Column title="描述" key="desc" dataIndex="desc" />
                <Table.Column title="操作" key="action" dataIndex="action"
                    render={(act, row, _index) => {
                        return <span>
                            <Popconfirm
                                placement="topRight" title={`你确定要删除环境【${row.name}】吗？`} onConfirm={async () => {
                                    this.setState({ loading: true });
                                    let response = await bus.Execute("apibus.envs.del", {
                                        envid: row.id
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
                                    let envs = this.state.envs;
                                    envs.splice(_index, 1);
                                    this.setState({ envs: envs });
                                }} okText="确定" cancelText="取消"
                            ><a href="#">删除</a></Popconfirm>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => {
                                this.setState({
                                    form: <EnvForm title={`编辑环境:${row.name}`} initValue={{
                                        name: row.name,
                                        url: row.url,
                                        desc: row.desc
                                    }} onCancel={() => {
                                        this.setState({ form: null })
                                    }} onOk={async (values, completed) => {
                                        //this.setState({loading:true});
                                        let response = await bus.Execute("apibus.envs.update", {
                                            name: values["name"],
                                            url: values["url"],
                                            desc: values["desc"],
                                            envid: row.id
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
                                        let envs = this.state.envs;
                                        envs[_index] = response;
                                        this.setState({ envs: envs, form: null });
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
export default Env;