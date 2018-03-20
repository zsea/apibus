const components = [
    "Home"
    , "Env"
    , "Group"
    , "Api"
    , "App"
    , "Test"
]
export default function () {
    components.forEach((item) => {
        require('../components/' + item + '/index.js')()
    });
}