import React from 'react'
import { Icon } from 'antd'

//import Home from './home';
import Bundle from '../../common/bundle';
import Test from 'bundle-loader?lazy&name=[name]!./test';

const TestComponent = () => (
    <Bundle load={Test}>
        {(Child) => <Child />}
    </Bundle>
)
export default function () {
    window.Configs.push({
        component: TestComponent
        , path: '/test'
        , exact: false
        , key: "test"
        , menu: {
            item: {
                icon: <Icon type="eye" />,
                title: "接口测试"
            }
        },
        breadcrumb: ['接口测试']
    })
}