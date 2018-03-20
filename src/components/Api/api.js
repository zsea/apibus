
import React from 'react';
import { bus } from '../../common/apibus'
import { Table, Button, Icon, Modal, Form, Input, Divider, Popconfirm, Switch, Select, Checkbox, InputNumber, Row, Col } from 'antd';
const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 }
};
const ApiForm = Form.create()(class extends React.Component {
    constructor(props) {
        super(props);

        this.state = Object.assign({ visible: true, confirmLoading: false, initValue: {} }, props);
        this.onOk = this.onOk.bind(this);
        this.completed = this.completed.bind(this);
    }
    async completed(success) {
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
                <Form.Item {...formItemLayout} label="接口名称">
                    {getFieldDecorator('api', {
                        rules: [{
                            required: true,
                            message: '请填写接口名称。',
                        }],
                        initialValue: this.state.initValue["method"]
                    })(
                        <Input placeholder="" />
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="运行环境">
                    {getFieldDecorator('envid', {
                        rules: [{
                            required: true,
                            message: '请选择运行环境。',
                        }],
                        initialValue: this.state.initValue["envid"]
                    })(
                        <Select>
                            {
                                (this.state.envs || []).map(function (e) {
                                    return <Select.Option value={e.id} key={e.id}>{e.name}</Select.Option>
                                })
                            }
                        </Select>
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="分组">
                    {getFieldDecorator('groupid', {
                        rules: [{
                            required: true,
                            message: '请选择分组。',
                        }],
                        initialValue: this.state.initValue["groupid"]
                    })(
                        <Select onChange={(value, option) => {
                            let handler = "";
                            for (let i = 0; i < this.state.groups.length; i++) {
                                if (this.state.groups[i].id == value) {
                                    handler = this.state.groups[i].default_url;
                                    break;
                                }
                            }
                            let initValue = this.state.initValue;
                            initValue["url"] = handler;
                            this.setState({ initValue: initValue });
                        }}>
                            {
                                (this.state.groups || []).map(function (g) {
                                    return <Select.Option value={g.id} key={g.id}>{g.name}</Select.Option>
                                })
                            }
                        </Select>
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="处理器">
                    {getFieldDecorator('url', {
                        rules: [{
                            required: true,
                            message: '请填写处理器。'
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
                <Form.Item {...formItemLayout} wrapperCol={{ span: 16, offset: 4 }} colon={false}>
                    <Row>
                        <Col span={8}>
                            <Form.Item>
                                {getFieldDecorator('must_session', {
                                    rules: [],
                                    valuePropName: "checked",
                                    initialValue: this.state.initValue["must_session"]
                                })(
                                    <Checkbox>需要授权</Checkbox>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item>
                                {getFieldDecorator('status', {
                                    rules: [],
                                    valuePropName: "checked",
                                    initialValue: this.state.initValue["status"]
                                })(
                                    <Checkbox>启用</Checkbox>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        </Modal>
    }
});
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
        let response = await bus.Execute("apibus.api.status.update", { api: this.state.api, status: checked ? "enable" : "disabled" });
        this.setState({ loading: false });
        if (response.error_response) {
            Modal.error({
                title: "错误",
                content: response.error_response.sub_msg || response.error_response.msg || "系统错误。"
                , okText: "确定"
            });
        }
        this.setState({ checked: checked });
        this.setState({ loading: true });
        let sync_response = await bus.Execute("apibus.api.sync", {
            api: this.state.api
        });
        this.setState({ loading: false });
        this.state.onChange && this.state.onChange(checked)
    }
    render() {
        return <Switch onChange={this.onChange} loading={this.state.loading} size="small" checked={this.state.checked} />
    }
}
const FieldForm = Form.create()(class extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({ visible: true, confirmLoading: false, initValue: {}, dataType: (props.initValue || {})["type"] }, props);
        this.onOk = this.onOk.bind(this);
        this.completed = this.completed.bind(this);
    }
    async completed(success) {
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
                <Form.Item {...formItemLayout} label="参数名称">
                    {getFieldDecorator('name', {
                        rules: [{
                            required: true,
                            message: '请填写参数名称。',
                        }],
                        initialValue: this.state.initValue["name"]
                    })(
                        <Input placeholder="" />
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="数据类型">
                    {getFieldDecorator('type', {
                        rules: [{
                            required: true,
                            message: '请选择数据类型。',
                        }],
                        initialValue: this.state.initValue["type"]
                    })(
                        <Select onChange={(v) => {
                            this.setState({ dataType: v })
                        }}>
                            <Select.Option value="number">Number</Select.Option>
                            <Select.Option value="boolean">Boolean</Select.Option>
                            <Select.Option value="string">String</Select.Option>
                            <Select.Option value="enum">Enum</Select.Option>
                            <Select.Option value="json">JSON</Select.Option>
                            <Select.Option value="json-array">JSON-Array</Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="默认值">
                    {getFieldDecorator('defaultValue', {
                        rules: [],
                        initialValue: this.state.initValue["defaultValue"]
                    })(
                        <Input placeholder="" />
                    )}
                </Form.Item>
                {
                    ["string", "json", "json-array"].indexOf(this.state.dataType) > -1 ? <Form.Item {...formItemLayout} label="最大长度">
                        {getFieldDecorator('maxLength', {
                            rules: [],
                            initialValue: this.state.initValue["maxLength"]
                        })(
                            <InputNumber min={0} precision={0} />
                        )}
                    </Form.Item> : null
                }
                {
                    this.state.dataType == "number" ? <Form.Item {...formItemLayout} label="范围">
                        <Row>
                            <Col span={10}>
                                <Form.Item>
                                    {getFieldDecorator('min', {
                                        rules: [],
                                        initialValue: this.state.initValue["min"]
                                    })(
                                        <InputNumber />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <div style={{ textAlign: "center" }}>-</div>
                            </Col>
                            <Col span={10}>
                                <Form.Item>
                                    {getFieldDecorator('max', {
                                        rules: [],
                                        initialValue: this.state.initValue["max"]
                                    })(
                                        <InputNumber />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form.Item> : null
                }
                {
                    this.state.dataType == "enum" ? <Form.Item {...formItemLayout} label="范围">
                        {getFieldDecorator('list', {
                            rules: [],
                            initialValue: this.state.initValue["list"]
                        })(
                            <Input placeholder="多个值用英文逗号隔开" />
                        )}

                    </Form.Item> : null
                }
                <Form.Item {...formItemLayout} label="描述">
                    {getFieldDecorator('desc', {
                        rules: [],
                        initialValue: this.state.initValue["desc"]
                    })(
                        <Input.TextArea rows={6} />
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="　" colon={false}>

                    {getFieldDecorator('required', {
                        rules: [],
                        valuePropName: "checked",
                        initialValue: this.state.initValue["required"]
                    })(
                        <Checkbox>必填</Checkbox>
                    )}
                </Form.Item>
            </Form>
        </Modal>
    }
});
class Arguments extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign({ fields: [], loading: false }, props);
        this.Load = this.Load.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.onTitle = this.onTitle.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
        this.Load();
    }
    async Load() {
        this.setState({ loading: true });
        let response = await bus.Execute("apibus.api.fields.get", {
            api: this.state.api
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
        this.setState({ fields: response });
    }
    componentDidMount() {
        this.Load()
    }
    onTitle() {
        return <div><Button.Group>
            <Button onClick={() => {
                this.Load();
            }}>
                <Icon type="reload" />
                刷新
            </Button>
            <Button type="primary" onClick={() => {
                this.setState({
                    form: <FieldForm title="添加参数" onCancel={() => {
                        this.setState({ form: null })
                    }} onOk={async (values, completed) => {
                        //this.setState({loading:true});
                        let response = await bus.Execute("apibus.api.field.add", Object.assign({ api: this.state.api }, values));
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

                        let sync_response = await bus.Execute("apibus.api.sync", {
                            api: this.state.api
                        });
                        if (sync_response.error_response) {
                            Modal.error({
                                title: "错误",
                                content: sync_response.error_response.sub_msg || sync_response.error_response.msg || "系统错误。"
                                , okText: "确定"
                            });
                        }
                        let fields = this.state.fields;
                        fields.unshift(response);
                        this.setState({ fields: fields, form: null });
                        completed(true);
                    }} />
                });
            }}>
                添加<Icon type="plus" />
            </Button>
        </Button.Group></div>
    }
    render() {
        return <div>{this.state.form}
            <Table
                title={this.state.id ? this.onTitle : null}
                loading={this.state.loading} rowKey="name" dataSource={this.state.fields} pagination={false}>
                <Table.Column title="参数名" key="name" dataIndex="name" />
                <Table.Column title="数据类型" key="type" dataIndex="type" />
                <Table.Column title="必填" key="required" dataIndex="required"
                    render={v => v ? <span style={{ color: "red" }}>是</span> : "否"}
                />
                <Table.Column title="默认值" key="defaultValue" dataIndex="defaultValue" />
                <Table.Column title="最大长度" key="maxLength" dataIndex="maxLength" />
                <Table.Column title="范围" key="range" dataIndex="range"
                    render={(range, row) => {
                        if (row.type == "number") {
                            let hasMax = false, hasMin = false;
                            if (row.max != null || row.max != undefined) {
                                hasMax = true;
                            }
                            if (row.min != null || row.min != undefined) {
                                hasMin = true;
                            }
                            if (hasMax || hasMin) {
                                return "[" + (hasMin ? row.min : " ") + "-" + (hasMax ? row.max : " ") + "]";
                            }
                            return ""
                        }
                        else if (row.type == "enum") {
                            return row.list;
                        }
                        else if (row.type == "boolean") {
                            return "true,false"
                        }
                        return ""
                    }}
                />
                <Table.Column title="描述" key="desc" dataIndex="desc" />
                <Table.Column title="操作" key="action" dataIndex="action"
                    render={(act, row, _index) => {
                        if (!this.state.id) return "";
                        return <span>
                            <Popconfirm
                                placement="topRight" title={`你确定要删除接口${this.state.api}的参数【${row.name}】吗？`} onConfirm={async () => {
                                    this.setState({ loading: true });
                                    let response = await bus.Execute("apibus.api.field.del", {
                                        api: this.state.api,
                                        field: row.name
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
                                    let sync_response = await bus.Execute("apibus.api.sync", {
                                        api: this.state.api
                                    });
                                    if (sync_response.error_response) {
                                        Modal.error({
                                            title: "错误",
                                            content: sync_response.error_response.sub_msg || sync_response.error_response.msg || "系统错误。"
                                            , okText: "确定"
                                        });
                                    }
                                    let fields = this.state.fields;
                                    fields.splice(_index, 1);
                                    this.setState({ fields: fields });
                                }} okText="确定" cancelText="取消"
                            ><a href="#">删除</a></Popconfirm>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => {
                                this.setState({
                                    form: <FieldForm title={`编辑参数:${row.name}`} initValue={row} onCancel={() => {
                                        this.setState({ form: null })
                                    }} onOk={async (values, completed) => {
                                        //this.setState({loading:true});
                                        let response = await bus.Execute("apibus.api.field.update", Object.assign({
                                            api: this.state.api,
                                            field: row.name
                                        }, values));
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
                                        let sync_response = await bus.Execute("apibus.api.sync", {
                                            api: this.state.api
                                        });
                                        if (sync_response.error_response) {
                                            Modal.error({
                                                title: "错误",
                                                content: sync_response.error_response.sub_msg || sync_response.error_response.msg || "系统错误。"
                                                , okText: "确定"
                                            });
                                        }
                                        let fields = this.state.fields;
                                        fields[_index] = response;
                                        this.setState({ fields: fields, form: null });
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
const size = 10;
class Api extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            apis: [],
            loading: false,
            envs: [],
            groups: [],
            keyword: ""
        }

        this.onTitle = this.onTitle.bind(this);
        this.Load = this.Load.bind(this);
        this.LoadGroupsAndEnvs = this.LoadGroupsAndEnvs.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    currentData = { pagination: { current: 1 }, filters: {}, sorter: {} }
    async Load(pagination, filters, sorter) {
        console.log(filters);
        let status = (filters["status"] || [])[0];
        if (status == "all") {
            status = "";
        }
        let groups = (filters["group"] || []).join(",")
        let envs = (filters["env"] || []).join(",")
        this.currentData = {
            pagination: pagination,
            filters: filters,
            sorter: sorter
        }
        let page = pagination.current;
        this.setState({ loading: true });
        let response = await bus.Execute("apibus.apis.get", {
            page: page,
            size: size,
            status: status,
            keyword: this.state.keyword,
            groupids: groups,
            envids: envs
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
        this.setState({ apis: response.apis, total: response.total });
    }
    async LoadGroupsAndEnvs() {
        this.setState({ loading: true });
        let group_response = await bus.Execute("apibus.groups.all.get", {});
        this.setState({ loading: false });
        if (group_response.error_response) {
            Modal.error({
                title: "错误",
                content: group_response.error_response.sub_msg || group_response.error_response.msg || "系统错误。"
                , okText: "确定"
            });
            return
        }
        this.setState({ groups: group_response });

        this.setState({ loading: true });
        let env_response = await bus.Execute("apibus.envs.all.get", {});
        this.setState({ loading: false });
        if (env_response.error_response) {
            Modal.error({
                title: "错误",
                content: env_response.error_response.sub_msg || env_response.error_response.msg || "系统错误。"
                , okText: "确定"
            });
            return
        }
        this.setState({ envs: env_response });
    }
    async componentDidMount() {
        await this.Load({ current: 1 }, {}, {});
        await this.LoadGroupsAndEnvs();
    }
    onTitle() {
        return <Row><Col span={16}><Button.Group size="large">
            <Button onClick={() => {
                this.Load(this.currentData.pagination, this.currentData.filters, this.currentData.sorter);
            }}>
                <Icon type="reload" />
                刷新
        </Button>
            <Button type="primary" onClick={() => {
                this.setState({
                    form: <ApiForm title="添加接口" groups={this.state.groups} envs={this.state.envs} initValue={{
                        envid: this.state.envs.length ? this.state.envs[0].id : undefined
                    }} onCancel={() => {
                        this.setState({ form: null })
                    }} onOk={async (values, completed) => {
                        //this.setState({loading:true});
                        let response = await bus.Execute("apibus.api.add", {
                            api: values["api"],
                            status: values["status"] === true ? "enable" : "disabled",
                            groupid: values["groupid"],
                            must_session: values["must_session"],
                            envid: values["envid"],
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
                        this.setState({ loading: true });
                        let sync_response = await bus.Execute("apibus.api.sync", {
                            api: response.method
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
                        let apis = this.state.apis;
                        apis.unshift(response);
                        this.setState({ apis: apis, form: null });
                        completed(true);
                    }} />
                });
            }}>
                添加
            <Icon type="plus" />
            </Button>
        </Button.Group></Col><Col span={8}><Input.Search defaultValue={this.state.keyword} onSearch={v => {
            //this.currentData.pagination.current = 1;
            this.setState({ keyword: v });
            setTimeout(() => { this.Load({ current: 1 }, {}, {}) }, 10);
        }} placeholder="" enterButton={<Icon type="search" />} size="large" /></Col></Row>
    }
    render() {
        return <div>
            {this.state.form}<Table
                title={this.onTitle}
                dataSource={this.state.apis}
                loading={this.state.loading}
                rowKey="method"
                onChange={this.Load}
                pagination={{
                    pageSize: size,
                    total: this.state.total,
                    showTotal: (total, range) => `共有数据${total}条。`
                }}
                expandedRowRender={(record) => <Arguments api={record.method} id={record.id} />}
            >
                <Table.Column title="接口" key="method" dataIndex="method" />
                <Table.Column title="状态" key="status" dataIndex="status"
                    filters={[{ text: "全部", value: "all" }, { text: "启用", value: "enable" }, { text: "禁用", value: "disabled" }]}
                    filterMultiple={false}
                    render={(s, row, _index) => {
                        if (!row.id) {
                            return <span style={{ color: "green" }}>启用</span>
                        }
                        return <Status size="small" checked={s == "enable"} api={row.method} onChange={checked => {
                            let apis = this.state.apis;
                            apis[_index].status = checked ? "enable" : "disabled";
                            this.setState({ apis: apis });
                        }} />
                    }}
                />
                <Table.Column title="分组" key="group" dataIndex="group"
                    filters={this.state.groups.map(g => {
                        return {
                            text: g.name,
                            value: g.id
                        }
                    })}
                    filterMultiple={true}
                    render={(g) => g.name}
                />
                <Table.Column title="授权" key="must_session" dataIndex="must_session"
                    render={(m, row) => m ? "需要" : ""}
                />
                <Table.Column title="环境" key="env" dataIndex="env"
                    filters={this.state.envs.map(e => {
                        return {
                            text: e.name,
                            value: e.id
                        }
                    })}
                    filterMultiple={true}
                    render={e => e.name}
                />
                <Table.Column title="处理器" key="handler" dataIndex="handler"
                    render={h => h.value}
                />
                <Table.Column title="说明" key="desc" dataIndex="desc" />
                <Table.Column title="操作" key="action" dataIndex="action"
                    render={(act, row, _index) => {
                        if (!row.id) {
                            return "";
                        }
                        return <span>
                            <Popconfirm
                                placement="topRight" title={`你确定要删除接口【${row.method}】吗？`} onConfirm={async () => {
                                    this.setState({ loading: true });
                                    let response = await bus.Execute("apibus.api.del", {
                                        api: row.method
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
                                    let apis = this.state.apis;
                                    apis.splice(_index, 1);
                                    this.setState({ apis: apis });
                                }} okText="确定" cancelText="取消"
                            ><a href="#">删除</a></Popconfirm>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => {
                                this.setState({
                                    form: <ApiForm groups={this.state.groups} envs={this.state.envs} title={`编辑接口:${row.method}`} initValue={{
                                        method: row.method,
                                        envid: row.env.id,
                                        groupid: row.group.id,
                                        url: row.handler.value
                                        , desc: row.desc
                                        , must_session: row.must_session
                                        , status: row.status == "enable"
                                    }} onCancel={() => {
                                        this.setState({ form: null })
                                    }} onOk={async (values, completed) => {
                                        //this.setState({loading:true});
                                        let response = await bus.Execute("apibus.api.update", {
                                            api: values["api"],
                                            status: values["status"] === true ? "enable" : "disabled",
                                            groupid: values["groupid"],
                                            must_session: !!values["must_session"],
                                            envid: values["envid"],
                                            url: values["url"],
                                            desc: values["desc"]
                                            , apiid: row.id
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
                                        let new_api = response;
                                        if (row.method != response.method) {
                                            this.setState({ loading: true });
                                            response = await bus.Execute("apibus.api.sync", {
                                                api: row.method
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
                                        }
                                        this.setState({ loading: true });
                                        response = await bus.Execute("apibus.api.sync", {
                                            api: new_api.method
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
                                        let apis = this.state.apis;
                                        apis[_index] = new_api;
                                        this.setState({ apis: apis, form: null });
                                        completed(true);

                                    }} />
                                });
                            }}>编辑</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={async () => {
                                this.setState({ loading: true });
                                let response = await bus.Execute("apibus.api.sync", {
                                    api: row.method
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
export default Api;