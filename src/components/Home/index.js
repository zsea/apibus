import React from 'react'
import { Icon } from 'antd'

//import Home from './home';
import Bundle from '../../common/bundle';
import Home from 'bundle-loader?lazy&name=[name]!./home';

const HomeComponent = () => (
    <Bundle load={Home}>
        {(Child) => <Child />}
    </Bundle>
)
export default function () {
    window.Configs.push({
        component: HomeComponent
        , path: '/'
        , exact: true
        , key: "home"
        , menu: {
            item: {
                icon: <Icon type="home" />,
                title: "首页"
            }
        },
        breadcrumb: ['首页']
    })
}