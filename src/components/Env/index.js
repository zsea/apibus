import React from 'react'
import { Icon } from 'antd'

//import Home from './home';
import Bundle from '../../common/bundle';
import Env from 'bundle-loader?lazy&name=[name]!./env';

const EnvComponent = () => (
    <Bundle load={Env}>
        {(Child) => <Child />}
    </Bundle>
)
export default function () {
    window.Configs.push({
        component: EnvComponent
        , path: '/env'
        , exact: false
        , key: "env"
        , menu: {
            item: {
                icon: <Icon type="bars" />,
                title: "环境管理"
            }
        },
        breadcrumb: ['环境管理']
    })
}