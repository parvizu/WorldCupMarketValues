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
			specs: {
				teamHeight: 80,
				vizWidth: 800,
				labelWidth: 100
			},
			minimums: {
				age: 16,
				caps: 0,
				value: 0,
				height: 1.6,
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
		this.getGroupTeams = this.getGroupTeams.bind(this);
	}

	componentWillMount() {
		const scales = this.getScales(this.state.criteria, this.state.selectedTeams);

		this.setState({
			scales: scales
		});
	}

	getMaxCeiling(criteria, value) {
		let maxValue = 0;
		let roundUp = 0;
		if (criteria === 'value') {
			if (value > 1000000) {
				roundUp = value%5000000;
				maxValue = roundUp>0 ? value + (5000000 - roundUp) : value+5000000;
			} else {
				maxValue = 1000000;
			}
		} else if (criteria === 'goals') {
			roundUp = value%5;
			maxValue = roundUp>0 ? value + (5 - roundUp) : value+5;
		} else if (criteria === 'caps') {
			roundUp = value%10;
			maxValue = roundUp>0 ?value + (10 - roundUp) : value+10;
		} else if (criteria === 'age') {
			roundUp = value%2;
			maxValue = roundUp>0 ?value + (2 - roundUp) : value+2;
		} else if (criteria === 'height') {
			roundUp = value%.05;
			maxValue = roundUp>0 ? value + (.05- roundUp) : value + .05;
		}

		console.log("MAX", maxValue, value);
		return maxValue;
	}

	getScales(criteria, selectedTeams) {
		const selectedRosters = this.getAllPlayersSelected();
		let maxValue = d3.max(selectedRosters.map(p => p[criteria]));
		maxValue = this.getMaxCeiling(criteria, maxValue);

		const xScale = d3.scale.linear()
			.domain([this.state.minimums[criteria],maxValue])
			.range([(this.state.specs.labelWidth+25), (this.state.specs.vizWidth+75)]);

		const yScale = d3.scale.ordinal()
			.domain(selectedTeams)
			.rangeRoundBands([50, selectedTeams.length * this.state.specs.teamHeight + 50])


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

		const newScales = this.getScales(newCriteria, this.state.selectedTeams);

		this.setState({
			criteria: newCriteria,
			scales: newScales
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

		console.log(e.target);
		const team = e.target.attributes['data-value'].value;


		let selectedTeams = this.state.selectedTeams;
		const position = selectedTeams.indexOf(team);
		if (position !== -1) {
			selectedTeams.splice(position,1);
		} else {
			selectedTeams.push(team);
		}

		// console.log(selectedTeams);

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

			const imgSrc = '/img/'+team.code+'.png';
			return (
				<li className={classes} onClick={this.handleTeamClick} data-value={team.country}>
					<img src={imgSrc} data-value={team.country}/>
				</li>
			)
		})
	}

	getGroupTeams() {
		const groups = 'ABCDEFGH'.split('');
		let groupTeams = {
			'A': [],
			'B': [],
			'C': [],
			'D': [],
			'E': [],
			'F': [],
			'G': [],
			'H': [],
		};

		this.state.rosters.forEach(team => {

			const classes = classNames({
				'teams-menu-option': true,
				'selected': this.state.selectedTeams.indexOf(team.country) !== -1
			});
			const imgSrc = '/img/'+team.code+'.png';
			groupTeams[team.group].push(
				<li className={classes} onClick={this.handleTeamClick} data-value={team.country}>
					<img src={imgSrc} data-value={team.country}/>
				</li>
			);
		});

		return groups.map(group => {
			const groupLabel = 'Group '+ group;
			return (
				<div>
					<div className="groups">
						{groupTeams[group]}
					</div>
					<div className="group-label">{groupLabel}</div>
				</div>
			)
		});

	}

	render() {
		const teams = this.state.rosters.filter(team => {
			return this.state.selectedTeams.indexOf(team.country) !== -1; 
		});

		const selectedTeams = teams.map(team => {
			return team.country;
		})
		const width = this.state.specs.vizWidth + this.state.specs.labelWidth;
		const height = this.state.selectedTeams.length * this.state.specs.teamHeight + 50;

		// <div className="teams">{this.getTeamsMenu()}</div>
		return (
			<div>
				<div className="teams-menu">
					{ this.getGroupTeams() }
				</div>
				<div className="main-content">
					<div className="menu">
						{ this.getMenuOptions() }
					</div>
					
					<TeamVisualization teamsData={teams} 
						selectedTeams={selectedTeams}
						scales={this.state.scales} 
						minimums={this.state.minimums}
						criteria={this.state.criteria} 
						size={[width,height]}/>
				</div>
			</div>
		);
	}
}


ReactDOM.render(<WorldCupMarketValue />, document.getElementById('app-container'));