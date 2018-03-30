
import React from 'react';
import { bus } from '../../common/apibus'
import { Table, Button, Icon, Modal, Form, Input, Divider, Popconfirm, Radio, InputNumber, Checkbox, Tooltip, Switch, Spin, Row, Col } from 'antd';
const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 }
};
const AppForm = Form.create()(class extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({ visible: true, confirmLoading: false, initValue: {} }, props);
        this.onOk = this.onOk.bind(this);
        this.completed = this.completed.bind(this);
    }
    async completed(success) {
        //if(this.com)
        /*
        this.setState({
            confirmLoading: false
        });
        if (success) {
            this.setState({
                visible: false
            });
        }*/
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
                <Form.Item {...formItemLayout} label="应用名称">
                    {getFieldDecorator('name', {
                        rules: [{
                            required: true,
                            message: '请填写应用名称',
                        }],
                        initialValue: this.state.initValue["name"]
                    })(
                        <Input placeholder="" />
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="流量">
                    {getFieldDecorator('flow', {
                        rules: [{
                            required: true,
                            message: '请填写流量。'
                        }],
                        initialValue: (this.state.initValue["flow"] == null || this.state.initValue["flow"] == undefined) ? 1000000 : Number(this.state.initValue["flow"])
                    })(
                        <InputNumber min={0} precision={0} />
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="描述">
                    {getFieldDecorator('summary', {
                        rules: [],
                        initialValue: this.state.initValue["summary"]
                    })(
                        <Input.TextArea rows={6} />
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} wrapperCol={{ span: 16, offset: 4 }} colon={false}>
                    <Row>
                        <Col span={6}>
                            <Form.Item>
                                {getFieldDecorator('enable', {
                                    rules: [],
                                    valuePropName: "checked",
                                    initialValue: this.state.initValue["enable"]
                                })(
                                    <Checkbox>启用</Checkbox>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item>
                                {getFieldDecorator('level', {
                                    rules: [],
                                    valuePropName: "checked",
                                    initialValue: this.state.initValue["level"]
                                })(
                                    <Checkbox>IP白名单</Checkbox>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        </Modal>
    }
});
const size = 10;
class Secret extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({ loading: false }, props);
    }
    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }
    render() {
        return <Spin size="small" spinning={this.state.loading}>
            {
                this.state.visible ? this.state.value : "******"
            }
            {
                this.state.visible ? <a href="javascript:;" onClick={() => {
                    this.setState({ visible: false })
                }}>&nbsp;隐藏</a> : <a href="javascript:;" onClick={() => {
                    this.setState({ visible: true })
                }}>&nbsp;显示</a>
            }
            {
                this.state.visible ? <Tooltip placement="topRight" title="重新生成Secret"><a href="javascript:;" onClick={async () => {
                    if (!await new Promise(function (resolve, reject) {
                        Modal.confirm({
                            title: "请确认",
                            content: "你确定要生成新的secret吗？",
                            onOk: function () {
                                resolve(true)
                            },
                            onCancel: function () {
                                resolve(false);
                            }
                        })
                    })) {
                        return;
                    }
                    this.setState({ loading: true });
                    let response = await bus.Execute("apibus.app.secret.update", { app: this.state.appkey });
                    this.setState({ loading: false });
                    if (response.error_response) {
                        Modal.error({
                            title: "错误",
                            content: response.error_response.sub_msg || response.error_response.msg || "系统错误。"
                            , okText: "确定"
                        });
                    }
                    this.setState({ loading: true });
                    let sync_response = await bus.Execute("apibus.app.sync", {
                        app: this.state.appkey
                    });
                    this.setState({ loading: false });
                    if (sync_response.error_response) {
                        Modal.error({
                            title: "错误",
                            content: sync_response.error_response.sub_msg || sync_response.error_response.msg || "系统错误。"
                            , okText: "确定"
                        });
                        return;
                    }
                    this.setState({ value: response.value, visible: false });
                }}>&nbsp;<Icon type="retweet" /></a></Tooltip> : null
            }

        </Spin>
    }
}
class Status extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({ loading: false }, props);
        this.onChange = this.onChange.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }
    async onChange(checked) {
        this.setState({ loading: true });
        let response = await bus.Execute("apibus.app.status.update", { app: this.state.appkey, status: checked ? "enable" : "disabled" });
        this.setState({ loading: false });
        if (response.error_response) {
            Modal.error({
                title: "错误",
                content: response.error_response.sub_msg || response.error_response.msg || "系统错误。"
                , okText: "确定"
            });
        }
        this.setState({ loading: true });
        let sync_response = await bus.Execute("apibus.app.sync", {
            app: this.state.appkey
        });
        this.setState({ loading: false });
        if (sync_response.error_response) {
            Modal.error({
                title: "错误",
                content: sync_response.error_response.sub_msg || sync_response.error_response.msg || "系统错误。"
                , okText: "确定"
            });
            return;
        }
        this.setState({ checked: checked });

        this.state.onChange && this.state.onChange(checked)
    }
    render() {
        return <Switch onChange={this.onChange} loading={this.state.loading} size="small" checked={this.state.checked} />
    }
}
class Power extends React.Component {
    constructor(props) {
        super(props);
        let allPower = false, apiChecked = [];
        if (props.apis === "*") {
            allPower = true;
        }
        else if (props.apis) {
            apiChecked = props.apis.split(",");
        }
        this.state = Object.assign({ form: false, modalLoading: false, allPower: allPower, apiList: [], apiChecked: apiChecked, currentPage: 1, apiTotal: 0, apiLoading: false }, props);
        this.LoadNextPage = this.LoadNextPage.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.onOk = this.onOk.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        let allPower = false, apiChecked = [];
        if (nextProps.apis === "*") {
            allPower = true;
        }
        else if (nextProps.apis) {
            apiChecked = nextProps.apis.split(",");
        }
        this.setState(Object.assign({ allPower: allPower, apiChecked: apiChecked }, nextProps))
    }
    async LoadNextPage(pagination, filters, sorter) {
        let page = pagination.current;
        this.setState({ apiLoading: true });
        let response = await bus.Execute("apibus.apis.get", {
            page: page,
            size: size
        });
        this.setState({ apiLoading: false });
        if (response.error_response) {
            Modal.error({
                title: "错误",
                content: response.error_response.sub_msg || response.error_response.msg || "系统错误。"
                , okText: "确定"
            });
            return
        }
        this.setState({ apiList: response.apis, apiTotal: response.total, currentPage: page });
    }
    componentDidMount() {

    }
    async onOk() {
        let apis = "";
        if (this.state.allPower) {
            apis = "*";
        }
        else {
            apis = this.state.apiChecked.join(",");
        }
        this.setState({ modalLoading: true, apiLoading: true });
        let response = await bus.Execute("apibus.app.power.update", {
            app: this.state.appkey,
            powers: apis
        });
        this.setState({ modalLoading: false, apiLoading: false });
        if (response.error_response) {
            Modal.error({
                title: "错误",
                content: response.error_response.sub_msg || response.error_response.msg || "系统错误。"
                , okText: "确定"
            });
            return
        }
        this.setState({ form: false });
        this.setState({ loading: true });
        let sync_response = await bus.Execute("apibus.app.sync", {
            app: this.state.appkey
        });
        this.setState({ loading: false });
        if (sync_response.error_response) {
            Modal.error({
                title: "错误",
                content: sync_response.error_response.sub_msg || sync_response.error_response.msg || "系统错误。"
                , okText: "确定"
            });
            return;
        }
        this.state.onChange && this.state.onChange(response.apis);
    }
    render() {
        let number = 0;
        if (!this.state.apis) {
            number = 0;
        }
        else {
            let apis = this.state.apis.split(",");
            number = apis.length;
        }
        return <span>
            <Modal title="权限设置"
                visible={this.state.form}
                maskClosable={false}
                width={600}
                onCancel={() => {
                    this.setState({ form: false })
                }}
                confirmLoading={this.state.modalLoading}
                onOk={this.onOk}
            >
                <Form>
                    <Form.Item {...formItemLayout} label="全部权限">
                        <Switch checked={this.state.allPower} onChange={checked => {
                            this.setState({ allPower: checked });
                            if (this.state.apiTotal === 0 && !checked) {
                                this.LoadNextPage({ current: 1 }, {}, {});
                            }
                        }} />
                    </Form.Item>
                    {
                        this.state.allPower ? null : <Table
                            dataSource={this.state.apiList}
                            rowKey="method"
                            size="small"
                            onChange={this.LoadNextPage}
                            pagination={{
                                pageSize: size,
                                total: this.state.apiTotal,
                                size: "small",
                                current: this.state.currentPage,
                                showTotal: (total, range) => `共有接口${total}个，已选择${this.state.apiChecked.length}个。`
                            }}
                            loading={this.state.apiLoading}
                            rowSelection={{
                                selectedRowKeys: this.state.apiChecked,
                                onChange: (selectedRowKeys) => {
                                    this.setState({ apiChecked: selectedRowKeys });
                                }
                            }}
                        >
                            <Table.Column title="API" key="method" dataIndex="method" />
                            <Table.Column title="分组" key="group" dataIndex="group"
                                render={(g) => g.name}
                            />
                            <Table.Column title="说明" key="desc" dataIndex="desc" />
                        </Table>
                    }
                </Form>
            </Modal>
            {
                this.state.apis === "*" ? "全部" : `白名单(${number})`
            }
            <span>&nbsp;<a href="javascript:;" onClick={() => {
                this.setState({ form: true });
                if (this.state.apiTotal === 0 && !this.state.allPower) {
                    this.LoadNextPage({ current: 1 }, {}, {});
                }
            }}><Icon type="setting" /></a></span>
        </span>
    }
}
class Level extends React.Component {
    constructor(props) {
        super(props);
        let ipValue = "";
        if (props.ips) {
            ipValue = props.ips.split(",").join("\r\n");
        }
        this.state = Object.assign({ form: false, ipValue: ipValue, modalLoading: false }, props);

        this.onOk = this.onOk.bind(this);
    }
    componentWillReceiveProps(props) {
        let ipValue = "";
        if (props.ips) {
            ipValue = props.ips.split(",").join("\r\n");
        }
        this.setState(Object.assign({ ipValue: ipValue }, props));
    }
    async onOk() {
        let ips = this.state.ipValue.split("\n");
        ips = ips.map(function (i) {
            return i.trim();
        });
        let ipList = [];
        for (let i = 0; i < ips.length; i++) {
            if (/^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/ig.test(ips[i])) {
                ipList.push(ips[i]);
            }
        }
        ips = ipList.join(",");
        this.setState({ modalLoading: true });
        let response = await bus.Execute("apibus.app.ipwhite.update", {
            app: this.state.appkey,
            ips: ips
        });
        this.setState({ modalLoading: false });
        if (response.error_response) {
            Modal.error({
                title: "错误",
                content: response.error_response.sub_msg || response.error_response.msg || "系统错误。"
                , okText: "确定"
            });
            return
        }
        this.setState({ form: false });
        this.setState({ loading: true });
        let sync_response = await bus.Execute("apibus.app.sync", {
            app: this.state.appkey
        });
        this.setState({ loading: false });
        if (sync_response.error_response) {
            Modal.error({
                title: "错误",
                content: sync_response.error_response.sub_msg || sync_response.error_response.msg || "系统错误。"
                , okText: "确定"
            });
            return;
        }
        this.state.onChange && this.state.onChange(response.ipwhite);
    }
    render() {
        let number = 0;
        if (!this.state.ips) {
            number = 0;
        }
        else {
            let ips = this.state.ips.split(",");
            number = ips.length;
        }
        return <span>
            <Modal title="IP白名单"
                visible={this.state.form}
                maskClosable={false}
                onCancel={() => {
                    this.setState({ form: false })
                }}
                confirmLoading={this.state.modalLoading}
                onOk={this.onOk}
            >
                <Spin spinning={this.state.modalLoading}>
                    <Form>
                        <Form.Item {...formItemLayout} label="IP列表" help="一行一个，空行将会被自动删除。">
                            <Input.TextArea rows={10} value={this.state.ipValue} onChange={v => {
                                this.setState({ ipValue: v.target.value });
                            }} />
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
            白名单({number})
            <span>&nbsp;<a href="javascript:;" onClick={() => {
                this.setState({ form: true })
            }}><Icon type="setting" /></a></span>
        </span>
    }
}
class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            apps: [],
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
        let response = await bus.Execute("apibus.apps.get", {
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
            return;
        }
        this.setState({ apps: response.apps, total: response.total });
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
                    form: <AppForm title="添加应用" onCancel={() => {
                        this.setState({ form: null })
                    }} initValue={{ enable: true }} onOk={async (values, completed) => {
                        //this.setState({loading:true});
                        let response = await bus.Execute("apibus.app.add", {
                            name: values["name"],
                            status: values["enable"] ? "enable" : "disabled",
                            flow: values["flow"],
                            level: values["level"] ? "ipwhite" : "none",
                            summary: values["summary"]
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
                        this.setState({ loading: true });
                        let sync_response = await bus.Execute("apibus.app.sync", {
                            app: response.appkey
                        });
                        this.setState({ loading: false });
                        if (sync_response.error_response) {
                            Modal.error({
                                title: "错误",
                                content: sync_response.error_response.sub_msg || sync_response.error_response.msg || "系统错误。"
                                , okText: "确定"
                            });
                            return;
                        }
                        let apps = this.state.apps;
                        apps.unshift(response);
                        this.setState({ apps: apps, form: null });
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
                dataSource={this.state.apps}
                loading={this.state.loading}
                rowKey="appkey"
                onChange={this.Load}
                pagination={{
                    pageSize: size,
                    total: this.state.total,
                    showTotal: (total, range) => `共有数据${total}条。`
                }}
            >
                <Table.Column title="名称" key="name" dataIndex="name" />
                <Table.Column title="app key" key="appkey" dataIndex="appkey" />
                <Table.Column title="密钥" key="secret" dataIndex="secret"
                    render={(secret, row) => <Secret visible={false} value={secret} appkey={row.appkey} />}
                />
                <Table.Column title="状态" key="status" dataIndex="status"
                    render={(status, row, _index) => <Status checked={status == "enable"} appkey={row.appkey} onChange={(checked) => {
                        let apps = this.state.apps;
                        apps[_index].status = checked ? "enable" : "disabled";
                        this.setState({ apps: apps });
                    }} />}
                />
                <Table.Column title="流量" key="flow" dataIndex="flow"
                    render={(f) => `${f}次/天`}
                />
                <Table.Column title="权限" key="apis" dataIndex="apis"
                    render={(a, row, _index) => <Power apis={a} appkey={row.appkey} onChange={(value) => {
                        let apps = this.state.apps;
                        apps[_index].apis = value;
                        this.setState({ apps: apps });
                    }} />}
                />
                <Table.Column title="安全等级" key="level" dataIndex="level"
                    render={(l, row, _index) => l == "none" ? "无" : <Level ips={row.ipwhite} appkey={row.appkey} onChange={(value) => {
                        let apps = this.state.apps;
                        apps[_index].ipwhite = value;
                        this.setState({ apps: apps });
                    }} />}
                />
                <Table.Column title="说明" key="summary" dataIndex="summary" />
                <Table.Column title="操作" key="action" dataIndex="action"
                    render={(act, row, _index) => {
                        return <span>
                            <Popconfirm
                                placement="topRight" title={`你确定要删除应用【${row.name}】吗？`} onConfirm={async () => {
                                    this.setState({ loading: true });
                                    let response = await bus.Execute("apibus.app.del", {
                                        app: row.appkey
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
                                    let apps = this.state.apps;
                                    apps.splice(_index, 1);
                                    this.setState({ apps: apps });
                                }} okText="确定" cancelText="取消"
                            ><a href="#">删除</a></Popconfirm>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => {
                                this.setState({
                                    form: <AppForm title={`编辑应用:${row.name}`} initValue={{
                                        name: row.name,
                                        flow: row.flow,
                                        summary: row.summary,
                                        enable: row.status == "enable",
                                        level: row.level == "ipwhite"
                                    }} onCancel={() => {
                                        this.setState({ form: null })
                                    }} onOk={async (values, completed) => {
                                        //this.setState({loading:true});
                                        let response = await bus.Execute("apibus.app.update", {
                                            app: row.appkey,
                                            name: values["name"],
                                            status: values["enable"] ? "enable" : "disabled",
                                            flow: values["flow"],
                                            level: values["level"] ? "ipwhite" : "none",
                                            summary: values["summary"]
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
                                        this.setState({ loading: true });
                                        let sync_response = await bus.Execute("apibus.app.sync", {
                                            app: response.appkey
                                        });
                                        this.setState({ loading: false });
                                        if (sync_response.error_response) {
                                            Modal.error({
                                                title: "错误",
                                                content: sync_response.error_response.sub_msg || sync_response.error_response.msg || "系统错误。"
                                                , okText: "确定"
                                            });
                                            return;
                                        }
                                        let apps = this.state.apps;
                                        response.ipwhite = apps[_index].ipwhite;
                                        response.apis = apps[_index].apis;
                                        apps[_index] = response;
                                        apps[_index]["secret"] = row.secret;
                                        this.setState({ apps: apps, form: null });
                                        completed(true);
                                    }} />
                                });
                            }}>编辑</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={async () => {
                                this.setState({ loading: true });
                                let response = await bus.Execute("apibus.app.sync", {
                                    app: row.appkey
                                });
                                this.setState({ loading: false });
                                if (response.error_response) {
                                    Modal.error({
                                        title: "错误",
                                        content: response.error_response.sub_msg || response.error_response.msg || "系统错误。"
                                        , okText: "确定"
                                    });
                                    return;
                                }
                            }}>同步</a>
                        </span>
                    }}
                />
            </Table></div>
    }
}
export default App;