
import React from 'react';
import ApiBus from '../../common/apibus'
import { Table, Button, Icon, Modal, Form, Input, Row, Col, Spin } from 'antd';

const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 }
};

const Test = Form.create()(class extends React.Component {
    constructor(props) {
        super(props);

        this.state = { callResult: "", loading: false };

        this.CallApi = this.CallApi.bind(this);
    }
    async CallApi() {
        var { validateFields } = this.props.form;

        let values = await new Promise(function (resolve) {
            validateFields(function (errors, v) {
                if (errors) {
                    resolve();
                }
                else {
                    resolve(v);
                }
            });
        });
        if (!values) return;
        let args;
        if (values["args"]) {
            try {
                args = JSON.parse(values["args"]);
            }
            catch (e) {
                Modal.error({
                    title: "错误",
                    content: "参数不是有效的JSON格式。"
                });
                return
            }
        }
        let bus = new ApiBus(values["appkey"], values["secret"], values["url"]);
        this.setState({ loading: true });
        let response = await bus.Execute(values["api"], args);
        this.setState({ loading: false, callResult: JSON.stringify(response, null, 4) });
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        let bus = ApiBus.bus;
        return <Row>
            <Col span={14}>
                <Spin spinning={this.state.loading}>
                    <Form>
                        <Form.Item {...formItemLayout} label="接口地址">
                            {getFieldDecorator('url', {
                                rules: [{
                                    required: true,
                                    message: '请填写接口地址。'
                                }, {
                                    type: "url",
                                    message: '不是有效的网址格式。'
                                }],
                                initialValue: bus.url
                            })(
                                <Input placeholder="" />
                            )}
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="AppKey">
                            {getFieldDecorator('appkey', {
                                rules: [{
                                    required: true,
                                    message: '请填写AppKey。'
                                }],
                                initialValue: bus.appkey
                            })(
                                <Input placeholder="" />
                            )}
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="Secret">
                            {getFieldDecorator('secret', {
                                rules: [{
                                    required: true,
                                    message: '请填写Secret。'
                                }],
                                initialValue: bus.secret
                            })(
                                <Input placeholder="" />
                            )}
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="API">
                            {getFieldDecorator('api', {
                                rules: [{
                                    required: true,
                                    message: '请填写API。'
                                }]
                            })(
                                <Input placeholder="" />
                            )}
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="调用参数">
                            {getFieldDecorator('args', {
                                rules: []
                            })(
                                <Input.TextArea rows={10} />
                            )}
                        </Form.Item>
                        <Form.Item {...formItemLayout} wrapperCol={{
                            span: 16,
                            offset: 4
                        }}>
                            <Button type="primary" onClick={this.CallApi}>测试</Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Col>
            <Col span={10}>
                <Row>
                    <Col span={20}>
                        调用结果：
                    </Col>
                </Row>
                <Row>
                    <Col span={20}>
                        <Input.TextArea value={this.state.callResult} rows={20} />
                    </Col>
                </Row>

            </Col>
        </Row>
    }
})
export default Test;