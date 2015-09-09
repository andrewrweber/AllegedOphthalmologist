var React = require('react/addons');
var Router = require('react-router');
var Link = Router.Link;

// Dispatcher
var Dispatcher = require('./../dispatcher/Dispatcher');

// ViewActions
var ViewActions = require('./../actions/ViewActions');
var ActionTypes = require('./../constants/Constants').ActionTypes;

//dialog
var Dialog = require('./dialogWindow.jsx');

// Form validation
var Formsy = require('formsy-react');
var FormInput = require('./FormInput.jsx');

// Material UI
var mui = require('material-ui');
var ThemeManager = new mui.Styles.ThemeManager();
var Avatar = mui.Avatar;
var Card = mui.Card;
var CardHeader = mui.CardHeader;
var CardText = mui.CardText;
var CardActions = mui.CardActions;
var FlatButton = mui.FlatButton;
var Paper = mui.Paper;
var Tabs = mui.Tabs;
var Tab = mui.Tab;

// D3 React Pie Chart
var Pie = require('./pieChart');

//Stores
var UserStore = require('./../stores/UserStore');
var DataStore = require('./../stores/DataStore');

// utils
var computePieData = require('./../utils/pieChartUtil');

var ProfileView = React.createClass({

  getInitialState: function() {
    // We can assume that these stores have data because
    // this view is only accessible to a logged in user
    return {
      user: {
        name: UserStore.getAccountAuth(),
        address: UserStore.getServiceAddress(),
        pgeLogin: UserStore.getPGEUsername()
      },
      data: {
        utilityData: DataStore.getData('Utility'),
        wattTimeData: DataStore.getData('Watt'),
        pieChart: {colorRange: ['#A60F2B','#e6e600','#528C18']},
      },
      chartData: [{},{},{}],
      showPieChart: false
    };
  },

  componentDidMount: function(){
    var context = this;
    this.token = Dispatcher.register(function (dispatch) {
      var action = dispatch.action;
      if (action.type === ActionTypes.PGE_UPDATE_SUCCESS) {
        context.updateSuccess();
      } 
      else if (action.type === ActionTypes.PGE_UPDATE_FAILURE) {
        context.updateFailure();
      } 
    });

    // Create Pie chart from WattTime and UtilityAPI Data
    if(this.state.data.utilityData && this.state.data.wattTimeData){
      // console.log("WattTime Data: ", this.state.data.wattTimeData)
      this.processPieData();
    }
  },

  componentDidUnmount: function(){
    Dispatcher.unregister(this.token);
  },

  processPieData: function(){

    this.state.chartData = computePieData(this.state.data.wattTimeData, 
                                          this.state.data.utilityData);
    this.setState({showPieChart: true});

  },

  updateSuccess: function(){
    // console.log('update sucess');
    this.enableButton();
    $('.spinner-container').css('visibility', 'hidden');
    $('.pge-update-success').css('visibility', 'visible');
  },

  updateFailure: function(){
    // console.log('update failure');
    this.enableButton();
    $('.spinner-container').css('visibility', 'hidden');
    $('.pge-update-failure').css('visibility', 'visible');
  },

  submitForm: function(data) {
    $('.spinner-container').css('visibility', 'visible');
    $('.pge-update-success').css('visibility', 'hidden');
    $('.pge-update-failure').css('visibility', 'hidden');
    this.disableButton();
    // console.log("Form submitted with: ", data);
    ViewActions.updateUserPGE(data);
  },

  enableButton: function () {
    this.setState({
      canSubmit: true
    });
  },
  disableButton: function () {
    this.setState({
      canSubmit: false
    });
  },

  render: function (){
    return(
      <div className="container">
        <Tabs>
        <Tab label="Account Summary">
          <Card initiallyExpanded={true}>
            <CardHeader
              title={this.state.user.name}
              avatar={<Avatar style={{color:'red'}}>{this.state.user.name ? this.state.user.name[0] : null}</Avatar>}
              showExpandableButton={false}>
            </CardHeader>
            <CardText zDepth={2}>
              <div className="user-summary">
                <p>Service Address: {this.state.user.address}</p>
                <p>PG&E Username:   {this.state.user.pgeLogin}</p>
                {this.state.showPieChart ?  
                <Pie colorRange={this.state.data.pieChart.colorRange} data={this.state.chartData} width={500} height={500} />
                : null
                }
              </div>
            </CardText>
          </Card>
        </Tab>
        <Tab label="Update PG&E Info.">
          <Paper className="update-pge-form" zDepth={2}>
            <Formsy.Form onSubmit={this.submitForm} onValid={this.enableButton} onInvalid={this.disableButton}>
              <FormInput name="pgeFullName" title="Full Name on PG&E Account" type="text" />
              <FormInput name="pgeUsername" title="PG&E Account Username" type="text" />
              <FormInput name="pgePassword" title="PG&E Account Password" type="password" 
                validations="minLength:4" validationError="Password must be at least 4 characters in length"/>
            <FlatButton className="btn btn-submit" type="submit" disabled={!this.state.canSubmit}>Update</FlatButton>
            </Formsy.Form>
            <div className="form-status">
              <div className="spinner-container">
                <div className="spinner-loader">Loading…</div>
              </div>
              <div className="pge-update-failure">
                <p>Update Failed</p>
              </div>
              <div className="pge-update-success">
                <p>Update Success!</p>
              </div>
            </div>
          </Paper>
        </Tab>
        </Tabs>

      </div>
    );
  }
});

module.exports = ProfileView;