import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import ReactFauxDom from 'react-faux-dom';

import TeamVisualization from './TeamVisualization';
import wcRosters from '../data/wcrosters.json';

import classNames from 'classnames';
import styles from './styles.scss';

export default class WorldCupMarketValue extends Component {
	
	constructor(props) {
		super(props);

		this.state = {
			rosters: wcRosters,
			selectedTeams: ['Mexico', 'Sweden','Argentina'],
			selectedRosters: [],
			criteria: 'value',
			scale: null,
			minimums: {
				age: 16,
				caps: 0,
				value: 0,
				height: 1.5,
				goals: 0
			}
		}

		this.getScale = this.getScale.bind(this);
		this.getTeamsMenu = this.getTeamsMenu.bind(this);
		this.getAllPlayersSelected = this.getAllPlayersSelected.bind(this);
		this.getTeamsVisualization = this.getTeamsVisualization.bind(this);
		this.handleMenuClick = this.handleMenuClick.bind(this);
		this.handleTeamClick = this.handleTeamClick.bind(this);
		this.renderAxis = this.renderAxis.bind(this);
	}

	componentWillMount() {
		const xScale = this.getScale(this.state.criteria);
		this.setState({
			scale: xScale
		});
	}

	getScale(criteria) {
		const selectedRosters = this.getAllPlayersSelected();
		let maxValue = d3.max(selectedRosters.map(p => p[criteria]));

		if (maxValue > 1000000) {
			console.log('Max', maxValue);
			let roundUp = (maxValue/1000000);
			console.log('RoundUp', roundUp);

			console.log('Ceil', Math.ceil(roundUp));

			console.log('Ceil Roundup', Math.ceil(roundUp)*1000000);

			maxValue = Math.ceil(roundUp)*1000000;
		}

		const xScale = d3.scale.linear()
			.domain([this.state.minimums[criteria],maxValue])
			.range([25, 775]);

		return xScale;
	}

	getAllPlayersSelected() {
		let allPlayersSelected = [];
		this.state.rosters.forEach(team => {
			if(this.state.selectedTeams.indexOf(team.country) !== -1) {
				allPlayersSelected = allPlayersSelected.concat(team.players);
			}
		});

		return allPlayersSelected;

	}

	getTeamsVisualization() {
		const teams = this.state.rosters.filter(team => {
			return this.state.selectedTeams.indexOf(team.country) !== -1; 
		});

		return teams.map(t => {
			return (
				<TeamVisualization teamData={t} scale={this.state.scale} criteria={this.state.criteria}/>
			)
		})
	}

	handleMenuClick(e) {
		e.preventDefault();

		const newCriteria = e.target.attributes['data-value'].value;

		const newScale = this.getScale(newCriteria);

		this.setState({
			criteria: newCriteria,
			scale: newScale
		})

	}

	getMenuOptions() {
		const options = ['value','age', 'caps','height','goals'];

		return options.map(opt => {

			const classes = classNames({
				  'menu-option': true,
				  'selected': opt === this.state.criteria
			  });
			return (
				<li className={classes} onClick={this.handleMenuClick} data-value={opt}>{opt}</li>
			)
		})

	}

	handleTeamClick(e) {
		e.preventDefault();

		const team = e.target.attributes['data-value'].value;

		let selectedTeams = this.state.selectedTeams;
		if (selectedTeams.indexOf(team) !== -1) {

		} else {
			selectedTeams.push(team);
		}

		console.log(selectedTeams);
		this.setState({
			selectedTeams: selectedTeams
		});
		// const newScale = this.getScale(this.state.criteria);
		// this.setState({
		// 	teamSelected: newScale
		// });
	}

	getTeamsMenu() {

		return this.state.rosters.map(team => {
			const classes = classNames({
				'teams-menu-option': true,
				'selected': this.state.selectedTeams.indexOf(team.country) !== -1
			});

			return (
				<li className={classes} onClick={this.handleTeamClick} data-value={team.country}>{team.country}</li>
			)
		})
	}

	renderAxis() {
		const node = ReactFauxDom.createElement('div')

		const svg = d3.select(node).append('svg')
			.attr({
				width:800,
				height:50,
				class: 'team-visualization-axis'
			});

		const xScale = this.state.scale;

		const xAxis = d3.svg.axis()
			.scale(xScale)
			.orient('top')
			// .ticks(10)
			.tickSize(12);

		const customXAxis = (g) => {
			g.call(xAxis);
			g.select(".domain").remove();
			g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "1,1");
			// g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
		}

		svg.append('g')
			.attr({
				class: 'x axis',
				transform: 'translate(0,25)'
			})
			.call(customXAxis);

		return node.toReact();
	}

	render() {
		const mexico = this.state.rosters[1];
		return (
			<div>
				<div className="teams">{this.getTeamsMenu()}</div>

				<div className="menu">
					{ this.getMenuOptions() }
				</div>
				{ this.renderAxis() }
				{ this.getTeamsVisualization() }
			</div>
		);
	}
}


ReactDOM.render(<WorldCupMarketValue />, document.getElementById('app-container'));