# APIBus文档
## 总纲
> APIBus是系统所有api的入口，完成所有api的参数校验、权限控制、隐藏内部接口地址、记录API调用日志。

> APIBus 管理系统提供对api的配置管理，以Web系统的方式提供生成api参数校验配置，并可自动生成api文档。APIBus管理系统提供以下功能：

> * 参数配置
> * 文档生成
> * 分组管理
> * 日志管理（未完成）

## API设计思想

#### 设计要求

> 所有的API提供统一的入口地址，参数签名方式。同时，要保证能够在Web系统和其它系统中都能使用，解决浏览器跨域调用api的问题。

#### 解决思路

> 以http[s]协议承载api的数据传输，服务器端响应POST和GET方法，同时支持JSONP数据回调（可解决跨域调用）。

#### 数据安全

> 为保障数据传输的安全，可使用https进行传输。同时，服务端将通过签名的方式校验客户端传输的参数。

> 不同的应该分配不同的appkey，不同的app具有不同的api调用权限和签名secret。

#### 签名算法

>签名算法使用md5，将所有请求参数按照字典排序进行拼接后，再在拼接字符串的末尾加上协商的安全密钥，进行md5计算，最终的结果作为签名。

> 如：请求的参数为：{a:1,b:3,c:2}
   先对三个字符串进行字典排序结果为：a=1，b=3，c=2
	再对三个字符串进行拼接：a=1&b=3&c=2{安全密钥}
	然后:md5(a=1&b=3&c=2{安全密钥})，将计算的结果作为signature的值。

> 注意：二进制参数据和值为空的参数不进入签名计算，即值为undefined、null和空字符串的参数不进行签名。**请保证secret参数不被泄露。**

#### 公共参数

> 公共参数为每个api都支持的参数。所有的公共参数见下表：

| 参数名          |数据类型          |描述         |
|--------------|----------------|-----------|
|[*]appkey |string |申请应该用时分配的应该id。|
|[*]time |Number |请求发起的时间，使用Unix格式时间。和服务器时间误差大于10分钟的调用将被判定为无效。|
|[*]signature |string |参数签名。 |
|[*]method |string |调用的API方法。|
|[*]version |Number |协议版本号。目前仅支持3.0与4.0，其中3.0就原始后端返回的值，4.0添加了日志id信息。|
|session |string |若调用的api需要用户授权，则此参数必传。|
|[*]format |string |响应格式。可选值：json。|
|[*]sign_method |string |签名方法。目前仅支持md5。|
|ignore_fields|string |忽略签名的字段，多个字段用英文逗分隔，忽略的参数不能是业务参数和公共参数。主要用于jsonp中调用时，防止数据被浏览器缓存。 |
|request_mode|string |当接口不在当前环境下时的请求方式：proxy/redirect。proxy由当前apibus去请求下一级APIBus地址，redirect会返回一相应错误信息，由客户端自行重新访问。默认为proxy|

*   带星号标记的参数为必填参数。

#### 保留参数

> 保留参数用于api系统间通信，其它内部系统不允许使用系统保留的参数名称。

|  参数名     | 数据类型    | 描述    |
|------------|------------|--------|
|session  |string |授权用户的用户信息。 |

在接口后端中，session参数会转换为设置session时的值，即调用接口```apibus.session.create```设置的参数```value```的值。

**注意** 在后端的http头中，添加了```APIBUS-USER-IP```，传入前端调用接口者的IP地址。

#### 错误响应

* 调用API可能出现的错误有三类：API平台错误、ISV业务错误和容器类错误。
* 连接APIBus服务器错误主要是http连接错误或者连接被重置被拒绝等，这类错误是开发者访问APIBus服务器出现的问题，请直接联系服务器管理员或通过网络搜索答案。

##### API平台错误

API平台错误是主要包含两类错误：

* 错误码小于100(不包含15,40,41错误码)的调用错误，这种错误一般是由于用户的请求不符合各种基本校验而引起的。用户遇到这些错误的返回首先检查应用的权限、频率等情况，然后参照文档检验一下传入的参数是否完整且合法。
* 子错误码（sub_code）是"isp."开头的调用错误，这种错误一般是由于服务端异常引起的。用户遇到这类错误需要隔一段时间再重试就可以解决。

错误码小于100的平台级错误：

|错误码          |错误描述-英文          |错误描述-中文          |解决方案          |
|--------------|---------------------|---------------------|-----------------|
|3 |Upload Fail | 上传失败  | 将传入的文件格式改为正确的格式、适当的大小的文件放进消息体里面传输过来，如果传输仍然失败需要减小文件大小或者增加网络带宽进行尝试。  |
|7 |App Call Limited  | 调用次数超限，包含调用频率超限 |调整程序合理调用API，等限频时间过了再调用。 |
|9 |Http Action Not Allowed |HTTP方法被禁止 |请用大写的POST或GET，如果有文件等信息传入则一定要用POST才可以。|
|10 |Service Currently Unavailable | 服务不可用 |多数是由未知异常引起的，仔细检查传入的参数是否符合文档描述。|
|11 | Insufficient ISV Permissions | 权限不足 | 子错误码目前有：isv.permission-api-package-not-allowed 不允许访问不可访问组的API，isv.permission-ip-whitelist-limit IP限制不允许访问，建议到安全中心配置正确的IP白名单。 |
|12 |Insufficient User Permissions | 用户权限不足 | 当前授权用户无权调此该api。|
|21 |Missing Method |缺少方法名参数 |传入的参数加入method字段。 |
|22 |Invalid Method |不存在的方法名| 请检查API是确实存在的。|
|23 |Invalid Format |无效数据格式 |传入的format必需为json或jsonp中的一种。|
|24 |Missing Signature |缺少签名参数 |传入的参数中必需包含signature字段。|
|25	|Invalid Signature	 |无效签名	 |签名必需根据正确的算法算出来的。  |
|26	|Missing Session	 |缺少SessionKey参数	|传入的参数中必需包含session字段。 |
|27	|Invalid Session      |无效的SessionKey参数	|传入的session必需是用户绑定session拿到的，如果报session不合法可能是用户没有绑定session或session过期造成的，用户需要重新绑定一下然后传入新的session。 |
|28	|Missing App Key	|缺少AppKey参数	 |传入的参数必需包含appkey字段。 |
|29	|Invalid App Key	 |无效的AppKey参数	| 请使用分配给应用的正确appkey。 |
|30	|Missing Timestamp	 |缺少时间戳参数	|传入的参数中必需包含time参数。 |
|31	|Invalid Timestamp	|非法的时间戳参数	|时间戳必须使用Unixtime时间。APIBus服务端允许客户端请求时间误差为10分钟。 |
|32	|Missing Version	|缺少版本参数	 |传入的参数中必需包含version字段。 |
|33	|Invalid Version	 |非法的版本参数	|用户传入的版本号格式错误，必需为数字格式。
|34	|Unsupported Version	|不支持的版本号	|用户传入的版本号没有被支持，请使用正确的协议版本号。 |
|40 |Missing Required Arguments |缺少必选参数 |API文档中设置为必选的参数是必传的，请仔细核对文档。 |
|41 |Invalid Arguments |非法的参数 |参数类型不对，例如：需要传入的是数字类型的，却传入了字符类型的参数。 |
|42	|Insufficient session permissions	|短授权权限不足	| 调用的是高危API。
|43	|Parameter Error	|参数错误	|一般是用户传入参数非法引起的，请仔细检查入参格式、范围是否一一对应。 |
|44	|Invalid access token	|无效的access token	|一般是用户使用协议获取的sessionkey当做access token通过https方式调用API或调用环境搞错。 |
|47	|Invalid encoding	|编码错误	|一般是用户做http请求的时候没有用UTF-8编码请求造成的。 |
|48	|Invalid Request Mode	|无效请求模式	|可选值为：proxy/redirect。 |
|51 |Invalid Sign Method|签名方法错误 |目前签名方法仅支持md5。|
|52 |Redirect Url|需要重定向访问 |根据返回的location内容进行重定向访问。|
|99 |Service Return Error|ISV业务方返回的错误信息|ISV业务方执行时返回的错误信息，该错误一般都带有子错误信息。|

平台级子错误：

|子错误码格式	|错误信息	|归属方	|是否可在程序中重试  |
|--------------|----------|-----------|----------------------|
|isp.\*\*\*-service-unavailable	|调用后端服务\*\*\*抛异常，服务不可用	 |ISP	 |是 |
|isp.remote-service-error	|连接远程服务错误	|ISP	|是 |
|isp.remote-service-timeout	 |连接远程服务超时	|ISP	|是 |
|isp.remote-connection-error	|远程连接错误	 |ISP	|是 |
|isp.apibus-parse-error	|api解析错误（出现了未被明确控制的异常信息）	|ISP	|否 |
|isp.apibus-remote-connection-timeout	|apibus连接后端服务超时	|ISP	 |是 |
|isp.apibus-remote-connection-error	 |apibus连接后端服务错误，找不到服务	|ISP	|是 |
|isp.apibus-mapping-parse-error	 |apibus-mapping转换出错，主要是由于传入参数格式不对	|ISP	|否 |
|isp.unknown-error	|apibus连接后端服务抛未知异常信息	|ISP	|是 |

平台校验子错误：

|子错误码格式	|错误信息	|归属方	|是否可在程序中重试  |
|--------------|----------|-----------|----------------------|
|ise.missing-required-arguments:\*\*\*|缺少必选参数：\*\*\*|ISP |否|
|ise.invalid-arguments:\*\*\*|参数\*\*\*的类型必须为\*\*\*|ISP |否|
|ise.parameter-error-min:\*\*\*|参数\*\*\*的值必须大于等于\*\*\*|ISP |否|
|ise.parameter-error-max:\*\*\*|参数\*\*\*的值必须小于等于\*\*\*|ISP |否|