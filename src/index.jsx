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
			selectedTeams: ['Mexico', 'Spain'],
			selectedRosters: [],
			criteria: 'value',
			scales: {},
			minimums: {
				age: 16,
				caps: 0,
				value: 0,
				height: 1.5,
				goals: 0
			}
		}

		this.getScales = this.getScales.bind(this);
		this.getTeamsMenu = this.getTeamsMenu.bind(this);
		this.getAllPlayersSelected = this.getAllPlayersSelected.bind(this);
		// this.getTeamsVisualization = this.getTeamsVisualization.bind(this);
		this.handleMenuClick = this.handleMenuClick.bind(this);
		this.handleTeamClick = this.handleTeamClick.bind(this);
		// this.renderAxis = this.renderAxis.bind(this);
	}

	componentWillMount() {
		const scales = this.getScales(this.state.criteria, this.state.selectedTeams);

		this.setState({
			scales: scales
		});
	}

	getScales(criteria, selectedTeams) {
		const selectedRosters = this.getAllPlayersSelected();
		let maxValue = d3.max(selectedRosters.map(p => p[criteria]));

		if (maxValue > 1000000) {
			let roundUp = (maxValue/1000000);
			maxValue = Math.ceil(roundUp)*1000000;
		}

		const xScale = d3.scale.linear()
			.domain([this.state.minimums[criteria],maxValue])
			.range([25, 775]);

		const yScale = d3.scale.ordinal()
			.domain(selectedTeams)
			.rangeRoundBands([50, selectedTeams.length * 100 + 50])


		return {
			x: xScale,
			y: yScale
		};
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

	handleMenuClick(e) {
		e.preventDefault();

		const newCriteria = e.target.attributes['data-value'].value;

		const newScales = this.getScales(newCriteria);

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
		const position = selectedTeams.indexOf(team);
		if (position !== -1) {
			selectedTeams.splice(position,1);
		} else {
			selectedTeams.push(team);
		}

		console.log(selectedTeams);

		const newScales = this.getScales(this.state.criteria, selectedTeams);

		this.setState({
			selectedTeams: selectedTeams,
			scales: newScales
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

	// renderAxis() {
	// 	const node = ReactFauxDom.createElement('div')

	// 	const svg = d3.select(node).append('svg')
	// 		.attr({
	// 			width:800,
	// 			height:50,
	// 			class: 'team-visualization-axis'
	// 		});

	// 	const xScale = this.state.scale;

	// 	const xAxis = d3.svg.axis()
	// 		.scale(xScale)
	// 		.orient('top')
	// 		// .ticks(10)
	// 		.tickSize(12);

	// 	const customXAxis = (g) => {
	// 		g.call(xAxis);
	// 		g.select(".domain").remove();
	// 		g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "1,1");
	// 		// g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
	// 	}

	// 	svg.append('g')
	// 		.attr({
	// 			class: 'x axis',
	// 			transform: 'translate(0,25)'
	// 		})
	// 		.call(customXAxis);

	// 	return node.toReact();
	// }


	render() {
		const teams = this.state.rosters.filter(team => {
			return this.state.selectedTeams.indexOf(team.country) !== -1; 
		});

		const selectedTeams = teams.map(team => {
			return team.country;
		})

		return (
			<div>
				<div className="teams">{this.getTeamsMenu()}</div>

				<div className="menu">
					{ this.getMenuOptions() }
				</div>
				
				<TeamVisualization teamData={teams} 
					selectedTeams={selectedTeams}
					scales={this.state.scales} 
					criteria={this.state.criteria} 
					size={[800,this.state.selectedTeams.length*100+50]}/>
			</div>
		);
	}
}


ReactDOM.render(<WorldCupMarketValue />, document.getElementById('app-container'));