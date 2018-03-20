import React from 'react'
import { Icon } from 'antd'

//import Home from './home';
import Bundle from '../../common/bundle';
import Group from 'bundle-loader?lazy&name=[name]!./group';

const GroupComponent = () => (
    <Bundle load={Group}>
        {(Child) => <Child />}
    </Bundle>
)
export default function () {
    window.Configs.push({
        component: GroupComponent
        , path: '/group'
        , exact: false
        , key: "group"
        , menu: {
            item: {
                icon: <Icon type="tags" />,
                title: "分组管理"
            }
        },
        breadcrumb: ['分组管理']
    })
}