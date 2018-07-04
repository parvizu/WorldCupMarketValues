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
		this.addTeamBasicStats = this.addTeamBasicStats.bind(this);
	}

	componentDidMount() {
		this.createVisualization();
	}

	shouldComponentUpdate(nextProps,nextState) {
		if (this.props.criteria !== nextProps.criteria)
			return true;

		if (this.props.selectedTeams.length !== nextProps.selectedTeams.length) {
			if (this.props.selectedTeams.length > nextProps.selectedTeams.length) {
				this.cleanVisualization(nextProps);
			}
			return true;
		}

		return false;
	}

	componentDidUpdate() {
		this.createVisualization();
	}

	cleanVisualization(nextProps) {
		const node = this.node;
		const removedTeams = this.props.selectedTeams.filter(team => {
			return !nextProps.selectedTeams.includes(team);
		});

		const removedTeamsData = this.props.teamsData.filter(team => {
			return removedTeams.includes(team.country);
		});

		// console.log(removedTeamsData);
		removedTeamsData.forEach(team => {
			console.log("REMOVING", team);
			d3.select(node).selectAll('g.'+team.code)
				// .transition()
				// .duration(100)
				// .style('opacity', 0)
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

		d3.select(node).select('g.axis.top')
			.transition(100)
			.style('opacity',0)
			.remove();

		d3.select(node).append('g')
			.attr({
				class: 'x axis top',
				transform: 'translate(0,'+(this.props.size[1]-40)+')'
			})
			.call(customXAxis);

		const xAxisBottom = d3.svg.axis()
			.scale(this.props.scales.x)
			.orient('bottom')
			.ticks(12)
			.tickSize(0);

		d3.select(node).select('g.axis.bottom')
			.transition(100)
			.style('opacity',0)
			.remove();

		d3.select(node).append('g')
			.attr({
				class: 'x axis bottom',
				transform: 'translate(0,'+(this.props.size[1]-40)+')'
			})
			.call(xAxisBottom);


 


	}


	createVisualization() {
		this.addAxis();
		// Adding the char for each team selected
		this.props.teamsData.forEach((team,i) => {
			// console.log('Team', team.country);
			// this.addTeamLabels(team);
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

		this.addTeamBasicStats(this.props.criteria, teamData);

		d3.select(node).select('g.'+teamData.code)
				.attr({
					transform: 'translate(0,'+this.props.scales.y(teamData.country)+')'
				});

		d3.select(node).select('g.'+teamData.code)
			.append('text')
			.text(teamData.country)
				.attr({
					x: 20,
					y: 5
				});

		d3.select(node).select('g.'+teamData.code)
			.selectAll('circle')
			.data(teamData.players)
			.enter()
			.append('circle')
				.attr({
					cx: this.props.scales.x(this.props.minimums[this.props.criteria]),
					// cy: this.props.scales.y(teamData.country),
					r: 15,
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

	addTeamBasicStats(criteria,teamData) {
		const players = teamData.players,
			  node = this.node;

		let max = d3.max(players, p => p[criteria]),
			min = d3.min(players, p => p[criteria]),
			mean = d3.mean(players, p => p[criteria]),
			median = d3.mean(players, p => p[criteria]),
			range = max - min;

		// Mean Bar
		d3.select(node).select('g.'+teamData.code)
			.selectAll('rect')
			.data([mean])
			.enter()
			.append('rect')
				.attr({
					class: 'team-mean',
					x: this.props.scales.x(this.props.minimums[criteria]),
					y: -20,
					height: 40,
					width: 3
				});

		d3.select(node).selectAll('g.'+teamData.code+' rect.team-mean')
			.transition()
			.duration(1000)
			// .delay((d,i) => {return 200*i})
			.attr({
				x: this.props.scales.x(mean)
			});

		// Mean label
		d3.select(node).select('g.'+teamData.code)
			.selectAll('text')
			.data([mean])
			.enter()
			.append('text')
				.attr({
					class: 'team-mean',
					x: this.props.scales.x(this.props.minimums[criteria]),
					y: -25,
					'text-anchor': 'middle'
					// height: 50,
					// width: 3
				})
				.text(0);

		d3.select(node).selectAll('g.'+teamData.code+' text.team-mean')
			.transition()
			.duration(1000)
			// .delay((d,i) => {return 200*i})
			.attr({
				x: this.props.scales.x(mean)
			})
			.text(d3.format(",.2f")(mean));

	}

	render() {
		return (
			<div>
				<svg className="team-visualization" 
					width={this.props.size[0]} 
					height={this.props.size[1]} 
					ref={node=>this.node=node} >
				</svg>
			</div>
		);
	}
}