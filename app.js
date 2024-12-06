let ReactRouter = window.ReactRouter
let Router = ReactRouter.Router
let IndexRoute = ReactRouter.IndexRoute
let Route = ReactRouter.Route
let Link = ReactRouter.Link
let Redirect = ReactRouter.Redirect
let History = window.History
let browserHistory = History.createBrowserHistory()

class HomePage extends React.Component{
    render() {
      return (
        <div>
            <h1>Hello World!</h1>
            <span><a href="dashboard">Go Dashboard</a></span>
        </div>
      );
    }
}

class Dashboard extends React.Component{
    render() {
      return (
        <div>
            <h1>Hello Dashboard!</h1>
        </div>
      );
    }
}

class NotFoundPage extends React.Component{
    render() {
      return (
        <div>
            <h1>The page you looking for was not found!</h1>
        </div>
      );
    }
}

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={HomePage}>
           <Route path="dashboard" component={Dashboard}></Route>
        </Route>
    </Router>
, document.getElementById('root'));