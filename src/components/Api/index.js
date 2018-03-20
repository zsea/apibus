import React from 'react'
import { Icon } from 'antd'

//import Home from './home';
import Bundle from '../../common/bundle';
import Api from 'bundle-loader?lazy&name=[name]!./api';

const ApiComponent = () => (
    <Bundle load={Api}>
        {(Child) => <Child />}
    </Bundle>
)
export default function () {
    window.Configs.push({
        component: ApiComponent
        , path: '/api'
        , exact: false
        , key: "api"
        , menu: {
            item: {
                icon: <Icon type="api" />,
                title: "接口管理"
            }
        },
        breadcrumb: ['接口管理']
    })
}