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
		// this.getSelectedTeamsLabel = this.getSelectedTeamsLabel.bind(this);
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
				transform: 'translate(0,'+(this.props.size[1]-30)+')'
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
				transform: 'translate(0,'+(this.props.size[1]-30)+')'
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

		d3.select(node).append('g')
				.attr({
					class: 'team '+teamData.code
				});

		this.addTeamBasicStats(this.props.criteria, teamData);

		d3.select(node).select('g.'+teamData.code)
				.attr({
					transform: 'translate(0,'+(this.props.scales.y(teamData.country)+10)+')'
				});

		d3.select(node).select('g.'+teamData.code+' g.team-label')
			.remove();

		d3.select(node).select('g.'+teamData.code).append('g')
			.attr({
				class: 'team-label',
				transform: 'translate('+(this.props.size[0]-100)+',0)'
			});

		d3.select(node).select('g.'+teamData.code+' g.team-label')
			.append('text')
				.attr({
					class: 'team-label-title'
				})
			.text(teamData.country)

		// d3.select(node).select('g.'+teamData.code+' g.team-label').append("defs")
		// 	.append("pattern")
		// 		.attr({
		// 	   		id: "team-flag-"+teamData.code,
		// 	   		height: 30
		// 	   	})
		// 	.append("image")
		// 		.attr("xlink:href", "/img/mex.png");

		// d3.select(node).select('g.'+teamData.code+' g.team-label')
		// 	.append('rect')
		// 		.attr({
		// 			class: 'team-label-flag',
		// 			width: 50,
		// 			height:30,
		// 			y: 5
		// 		})
		// 		.style({
		// 			fill: 'url(#team-flag-'+teamData.code+')'
		// 		});


		
		// d3.select(node).select('g.'+teamData.code+' g.team-label')
		// 	.append('text')
		// 		.attr({
		// 			class: 'selected-player-name',
		// 			y: 15
		// 		})
		// 		.text('')

		// d3.select(node).select('g.'+teamData.code+' g.team-label')
		// 	.append('text')
		// 		.attr({
		// 			class: 'selected-player-stat',
		// 			y: 25
		// 		})
		// 		.text('')


		// PLAYER ELEMENTS

		d3.select(node).select('g.'+teamData.code).selectAll('g.team-player circle')
			.remove();

		d3.select(node).select('g.'+teamData.code).selectAll('g.team-player text')
			.remove();

		d3.select(node).select('g.'+teamData.code).selectAll('g.team-player')
			.data(teamData.players)
			.enter()
			.append('g')
				.attr({
					class: 'team-player',
					transform: 'translate('+this.props.scales.x(this.props.minimums[this.props.criteria])+',0)',
					'player-num': (p) => {
						return p.number;
					}
				})
			.on('click', (p) => {
				const selectedPlayer =  d3.select(node).select('g.'+teamData.code+' g[player-num="'+p.number+'"]').attr('class');

				if (!selectedPlayer.includes('selected')) {
					d3.select(node).selectAll('g.'+teamData.code+' g.team-player').classed('selected', false);

					d3.select(node).select('g.'+teamData.code+' g[player-num="'+p.number+'"]')
						.classed('selected', true)
				} else {
					d3.select(node).selectAll('g.'+teamData.code+' g.team-player').classed('selected', false);
				}	
			})

		d3.select(node).select('g.'+teamData.code).selectAll('g.team-player')
			.append('circle')
				.attr({
					r: 15
				})

		d3.select(node).select('g.'+teamData.code).selectAll('g.team-player')
			.append('text')
				.attr({
					class: 'player-name',
					y: 30,
				})
				.text((d,i) => {
					return d.name
				});

		d3.select(node).select('g.'+teamData.code).selectAll('g.team-player')
			.append('text')
				.attr({
					class: 'player-stat',
					y: 45,
				})
				.text((d,i) => {
					const units = {
						age: 'years',
						value: '€',
						goals: 'goals',
						caps: 'games',
						height: 'm'
					}
					if (this.props.criteria === 'value') {
						const format = d3.format(",.0f");
						return format(d[this.props.criteria])+ ' '+units[this.props.criteria];
					}
					return d[this.props.criteria]+ ' '+units[this.props.criteria];
				});

		d3.select(node).selectAll('g.'+teamData.code+' g.team-player')
			.transition()
			.duration(1000)
			// .delay((d,i) => {return 200*i})
			.attr({
				transform: d=> {
					return 'translate('+this.props.scales.x(d[this.props.criteria])+',0)';
				} 
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
			.text(() => {
				const units = {
					age: 'years',
					value: '€',
					goals: 'goals',
					caps: 'games',
					height: 'm'
				}
				return d3.format(",.2f")(mean) + " " + units[this.props.criteria];
			});

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