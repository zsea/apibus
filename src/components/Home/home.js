
import React from 'react';
class Home extends React.Component {
    render() {
        return <div>
            <h1>介绍</h1>
            支持多云部署的API管理系统。APIBus是系统所有api的入口，完成所有api的参数校验、权限控制、隐藏内部接口地址。
            <h1>使用</h1>
            代码已开源到Github上，请参考项目文档。
            <br />
            Github地址：<a href="https://github.com/zsea/apibus" target="_blank">https://github.com/zsea/apibus</a>
        </div>;
    }
}
export default Home;