import React from 'react'
import { Icon } from 'antd'

//import Home from './home';
import Bundle from '../../common/bundle';
import App from 'bundle-loader?lazy&name=[name]!./app';

const AppComponent = () => (
    <Bundle load={App}>
        {(Child) => <Child />}
    </Bundle>
)
export default function () {
    window.Configs.push({
        component: AppComponent
        , path: '/app'
        , exact: false
        , key: "app"
        , menu: {
            item: {
                icon: <Icon type="appstore" />,
                title: "应用管理"
            }
        },
        breadcrumb: ['应用管理']
    })
}