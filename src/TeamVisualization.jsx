import React, {Component} from 'react';
import d3 from 'd3';
import classNames from 'classnames';

import styles from './TeamVisualization.scss';

export default class TeamVisualization extends Component {
	
	constructor(props) {
		super(props);

		this.createVisualization = this.createVisualization.bind(this);
		this.addTeamVisualization = this.addTeamVisualization.bind(this);
		this.addAxis = this.addAxis.bind(this);
		this.cleanVisualization = this.cleanVisualization.bind(this);
	}

	componentDidMount() {
		this.createVisualization();
	}


	componentWillUpdate(nextProps, nextState) {
		console.log("NewProps", nextProps.selectedTeams);
		console.log("Props", this.props.selectedTeams);
		const diff = this.props.selectedTeams.filter(team => {
			return !nextProps.selectedTeams.includes(team);
		});

		if (diff.length !== 0) {
			this.cleanVisualization(diff);
		}
	}

	componentDidUpdate() {
		this.createVisualization();
	}



	cleanVisualization(removedTeams) {
		const node = this.node;
		const removedTeamsData = this.props.teamData.filter(team => {
			return removedTeams.includes(team.country);
		});

		console.log(removedTeamsData);
		removedTeamsData.forEach(team => {
			console.log("REMOVING", team);
			d3.select(node).selectAll('g.'+team.code)
				.transition()
				.duration(100)
				.style('opacity', 0)
				.remove();
		});
	}

	addAxis() {
		const node = this.node;
		const axisHeight = this.props.size[1]-50;
		const xAxis = d3.svg.axis()
			.scale(this.props.scales.x)
			.orient('top')
			.ticks(12)
			.tickSize(axisHeight);

		const customXAxis = (g) => {
			g.call(xAxis);
			g.select(".domain").remove();
			g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "1,1");
			// g.remove();
			// g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
		}

		d3.select(node).select('g.axis')
			.remove();

		d3.select(node).append('g')
			.attr({
				class: 'x axis',
				transform: 'translate(0,'+(this.props.size[1]-40)+')'
			})
			.call(customXAxis);
	}


	createVisualization() {
		this.addAxis();
		// Adding the char for each team selected
		this.props.teamData.forEach((team,i) => {
			console.log('Team', team.country);
			this.addTeamVisualization(team,i);
		})

	}

	addTeamVisualization(teamData,i) {

		const node = this.node;
		// const xScale = this.props.scale.x;

		d3.select(node).append('g')
				.attr({
					class: 'team '+teamData.code
				});

		d3.select(node).select('g.'+teamData.code)
			.selectAll('circle')
			.data(teamData.players)
			.enter()
			.append('circle')
				.attr({
					cx: d => {
						// return xScale(d[this.props.criteria])
						return this.props.scales.x(0);
					},
					cy: this.props.scales.y(teamData.country),
					r: 20,
					class: 'team-player'
				});

		d3.select(node).selectAll('g.'+teamData.code+' circle')
			.transition()
			.duration(1000)
			// .delay((d,i) => {return 200*i})
			.attr({
				cx: d => {return this.props.scales.x(d[this.props.criteria])}
			});
	}

	render() {
		return (
			<div>
				<div className="country-name country-section"> { this.props.teamData.country }</div>
				<svg className="team-visualization" 
					width={this.props.size[0]} 
					height={this.props.size[1]} 
					ref={node=>this.node=node} >
				</svg>
			</div>
		);
	}
}