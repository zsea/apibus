const cfgs = [];
window.__defineGetter__("Configs", () => cfgs);

import React from 'react';
import ReactDOM from 'react-dom';
import "./assets/common.less";
//import "antd/dist/antd.min.css";
import ApiBus from './common/apibus'
import { Layout, Menu, Breadcrumb, Icon, Alert, Row, Col, Modal, LocaleProvider, Form, Input } from 'antd';
const { Header, Content, Footer, Sider } = Layout;
import zhCN from 'antd/lib/locale-provider/zh_CN';


import {
    Router,
    Route, Redirect
    //Link,
    //browserHistory
} from 'react-router-dom'
import { isMoment } from 'moment';


const history = require('history').createHashHistory();

//导入菜单

require('./configure/configs')();

const TMenu = (props) => {
    //console.log(props);
    var submenus = {}
    window.Configs.forEach((item) => {
        if (item.menu && item.menu.parent) {
            if (!submenus[item.menu.parent.key]) {
                submenus[item.menu.parent.key] = Object.assign({}, item.menu.parent);
            }
        }
    })
    var menus = [], selectedKey = null, openedKeys = [];
    window.Configs.forEach((item) => {
        if (item.menu && item.menu.item) {
            if (item.path == history.location.pathname) {
                selectedKey = item.key;
            }
            item.menu.item.key = item.key;
            item.menu.item.path = item.path;
            if (item.menu.parent) {
                openedKeys.push(item.menu.parent.key)
                if (submenus[item.menu.parent.key].imported) {
                    submenus[item.menu.parent.key].children.push(item.menu.item)
                }
                else {
                    submenus[item.menu.parent.key].__defineGetter__("imported", () => true)
                    submenus[item.menu.parent.key].__defineGetter__("type", () => "submenu")
                    submenus[item.menu.parent.key].children = [item.menu.item]
                    menus.push(submenus[item.menu.parent.key])
                }
            }
            else {
                menus.push(item.menu.item)
            }
        }
    })
    if (selectedKey && props.onInitialization) {
        window.Configs.some((cfg) => {
            if (cfg.key == selectedKey) {
                props.onInitialization(cfg.breadcrumb);
                return true
            }
        })
    }
    //console.log(history.location.pathname)
    return <Menu theme="dark" defaultSelectedKeys={[selectedKey]} defaultOpenKeys={openedKeys} mode="inline" onClick={(item) => {
        if (props.onSwitch) {
            var key = item.key;
            window.Configs.some((cfg) => {
                if (cfg.key == key) {
                    props.onSwitch(cfg.breadcrumb);
                    return true
                }
            })
        }
        history.push(item.item.props.path);

    }}>
        {menus.map((item, iii) => {
            if (item.type === "submenu") {
                return <Menu.SubMenu key={item.key} title={<span>{item.icon}<span>{item.title}</span></span>}>
                    {item.children.map((child) => {
                        return <Menu.Item key={child.key} path={child.path}>
                            {child.icon}
                            <span>{child.title}</span>
                        </Menu.Item>
                    })}
                </Menu.SubMenu>
            }
            else {
                return <Menu.Item key={item.key} path={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                </Menu.Item>
            }
        })}
    </Menu>
}

const fakeAuth = {}

fakeAuth.__defineGetter__("isAuthenticated", function () {

    return true;
})


const Authenicate = () => <NotAuthenticate />;

class PrivateRoute extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        //console.log(this.props);
        //console.log(fakeAuth.isAuthenticated);
        if (fakeAuth.isAuthenticated) {
            //console.log('已登录:',this.props.component)
            return <Route {...this.props} />
        }
        else {
            return <Route {...this.props} component={NotAuthenticate} />
        }
    }
}

const Setting = Form.create()(class extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign({ appSetting: false }, props);
        this.onOk = this.onOk.bind(this);
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
        window.localStorage.setItem("apibus:url", values["url"]);
        window.localStorage.setItem("apibus:appkey", values["appkey"]);
        window.sessionStorage.setItem("apibus:secret", values["secret"]);

        //this.state.onChange && this.state.onChange(values);
        this.setState({ appSetting: false, bus: ApiBus.bus });
    }
    render() {
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 16 }
        };
        const { getFieldDecorator } = this.props.form;
        return <span>
            <Modal
                title="系统设置"
                visible={this.state.appSetting}
                onCancel={() => {
                    this.setState({ appSetting: false });
                }}
                maskClosable={false}
                onOk={this.onOk}
            >
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
                            initialValue: this.state.bus.url
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
                            initialValue: this.state.bus.appkey
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
                            initialValue: this.state.bus.secret
                        })(
                            <Input placeholder="" />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
            Appkey:{this.state.bus.appkey}&nbsp;<a href="javascript:;" onClick={() => {
                this.setState({ appSetting: true })
            }}><Icon type="setting" /></a></span>
    }
});

class Main extends React.Component {
    state = {
        collapsed: false,
        breadcrumbs: [],
        initialization: false,
        bus: ApiBus.bus
    };
    onCollapse = (collapsed) => {
        //console.log(collapsed);
        this.setState({ collapsed });
    }
    isLoaded = false
    async componentDidMount() {

    }

    render() {
        return (
            <LocaleProvider locale={zhCN}><Layout style={{ minHeight: '100vh' }}>
                <Sider
                    collapsible
                    collapsed={this.state.collapsed}
                    onCollapse={this.onCollapse}
                >
                    <div className="logo" style={{ backgroundColor: this.state.collapsed ? "rgb(0,21,41)" : "rgba(255,255,255,0.2)" }}>
                        {this.state.collapsed ? <img src="/favicon.ico" /> : <span style={{ fontSize: 18 }}>APIBus V4.0</span>}
                    </div>
                    <TMenu onSwitch={(breadcrumbs) => {
                        this.setState({
                            breadcrumbs: breadcrumbs
                        })
                    }} />
                </Sider>
                <Layout>
                    <Header style={{ background: '#fff', padding: 0 }} >
                        <Row align="middle" gutter={10}>
                            <Col span={18}></Col>
                            <Col span={6}>
                                <Setting bus={this.state.bus} />
                            </Col>
                        </Row>
                    </Header>
                    <Content style={{ margin: '0 16px' }}>
                        <Breadcrumb style={{ margin: '16px 0' }}>
                            <Breadcrumb.Item>APIBus管理系统</Breadcrumb.Item>
                            {
                                (this.state.breadcrumbs || []).map((item, _index) => <Breadcrumb.Item key={_index}>{item}</Breadcrumb.Item>)
                            }
                        </Breadcrumb>
                        <Router history={history}>
                            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                                {window.Configs.map((item, _index) => <PrivateRoute exact={item.exact || false} path={item.path} component={item.component} key={item.key === undefined ? _index : item.key} />)}

                            </div>
                        </Router>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                        Copyright ©2016-2018 apibus.me. All Rights Reserved.
            </Footer>
                </Layout>
            </Layout>
            </LocaleProvider>
        );
    }
}

ReactDOM.render(<Main />, document.getElementById('root'));
