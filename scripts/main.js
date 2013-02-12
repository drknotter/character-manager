/*
This file is a part of D&D Character Manager - A Javascript program for managinng D&D Characters.
Copyright (C) 2013  Pat Plunkett

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

Author email: patplunkett@gmail.com
*/

var name, level, xp, wealth, init, speed;
var max_hp, surge_value, surges_per_day;
var abilities = {};
var defenses = {};
var skills = {};
var feats = [];
var item_powers = [];
var powers = [];
var conditions = [];

var SIDEBAR_W    = 200;
var RESET_H      = 40;

var POWER_BOX_W  = 0;
var N_POWER_COLS = 3;

var clicked_power;

var current_file;
var current_vals = {};
var timer;

function init_char(xml) {

    var char_exists = false;
    if( localStorage[current_file] ) {
        char_exists = true;
        current_vals = JSON.parse(localStorage[current_file]);
    }

    var stats = d3.select(xml).selectAll("Stat");
        
    name = d3.select(xml).select("name")[0][0].textContent;
    level = d3.select(xml).select("Level")[0][0].textContent;
    xp = d3.select(xml).select("Experience")[0][0].textContent;
    wealth = d3.select(xml).select("CarriedMoney")[0][0].textContent;

    if( !char_exists ) 
        current_vals.temp_hp = 0;

    if( !char_exists )
        current_vals.action_points = 1;

    surge_value = 0;
    for( var i=0; i<stats[0].length; i++ ) {
        
        var alias = d3.select(stats[0][i]).selectAll("alias").attr("name");
        if( alias && alias == "Strength" ) {
            abilities["str"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Constitution" ) {
            abilities["con"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Dexterity" ) {
            abilities["dex"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Intelligence" ) {
            abilities["int"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Wisdom" ) {
            abilities["wis"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Charisma" ) {
            abilities["cha"] = stats[0][i].attributes["value"].textContent;
        }

        if( alias && alias == "AC" ) {
            defenses["ac"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Fortitude Defense" ) {
            defenses["fort"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Reflex Defense" ) {
            defenses["ref"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Will Defense" ) {
            defenses["will"] = stats[0][i].attributes["value"].textContent;
        }

        if( alias && alias == "Hit Points" ) {
            if( !char_exists )
                current_vals.current_hp = stats[0][i].attributes["value"].textContent;
            max_hp = stats[0][i].attributes["value"].textContent;
            surge_value += Math.floor(max_hp/4);
        } else if( alias && alias == "Healing Surges" ) {
            if( !char_exists )
                current_vals.num_surges = stats[0][i].attributes['value'].textContent;
            surges_per_day = stats[0][i].attributes['value'].textContent;
        }

        if( alias && alias == "Initiative" ) {
            init = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Speed" ) {
            speed = stats[0][i].attributes["value"].textContent;
        }

        if( alias && alias == "Acrobatics" ) {
            skills["Acrobatics"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Arcana" ) {
            skills["Arcana"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Athletics" ) {
            skills["Athletics"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Bluff" ) {
            skills["Bluff"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Diplomacy" ) {
            skills["Diplomacy"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Dungeoneering" ) {
            skills["Dungeoneering"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Endurance" ) {
            skills["Endurance"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Heal" ) {
            skills["Heal"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "History" ) {
            skills["History"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Insight" ) {
            skills["Insight"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Intimidate" ) {
            skills["Intimidate"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Nature" ) {
            skills["Nature"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Perception" ) {
            skills["Perception"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Religion" ) {
            skills["Religion"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Stealth" ) {
            skills["Stealth"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Streetwise" ) {
            skills["Streetwise"] = stats[0][i].attributes["value"].textContent;
        } else if( alias && alias == "Thievery" ) {
            skills["Thievery"] = stats[0][i].attributes["value"].textContent;
        }

        if( alias && alias == "Healing Surge Value" ) {
            surge_value += Number(stats[0][i].attributes["value"].textContent);
        }
        
    }

    var feat_list = d3.select(xml).select('RulesElementTally').selectAll('RulesElement')
        .filter(function(){return this.attributes['type'].value == 'Feat' || this.attributes['type'].value == 'Class Feature'});

    feats = [];
    var description;
    for( var i=0; i<feat_list[0].length; i++ ) {
        description = '';
        if( d3.select(feat_list[0][i]).selectAll('specific')
            .filter(function(){return this.attributes['name'].value == 'Short Description'})[0][0] ) {
            description = d3.select(feat_list[0][i]).selectAll('specific')
                .filter(function(){return this.attributes['name'].value == 'Short Description'})[0][0].textContent;
            if( description[0] == ' ' )
                description = description.substr(1);
            if( description[description.length-1] == ' ' )
                description = description.substr(0,description.length-1);
        }
        feats.push({name:feat_list[0][i].attributes['name'].value,
                    desc:description});
    }

    // get the list of powers from items
    var loots = d3.select(xml).select('LootTally').selectAll('loot')
        .filter(function(){return Number(this.attributes['count'].value) > 0});

    items = [];
    var item;
    var rules_elements, item_powers, item_properties, power_usage;
    for( var i=0; i<loots[0].length; i++ ) {
        rules_elements = d3.select(loots[0][i]).selectAll('RulesElement');
        for( var j=0; j<rules_elements[0].length; j++ ) {
            item_powers = d3.select(rules_elements[0][j]).selectAll('specific')
                .filter(function(){return this.attributes['name'].value=='Power'});
            item_properties = d3.select(rules_elements[0][j]).selectAll('specific')
                .filter(function(){return this.attributes['name'].value=='Property'});
            if( item_powers[0].length > 0 || item_properties[0].length > 0 ) {
                item = {};
                item.name = rules_elements[0][j].attributes['name'].value;
                if( item_powers[0].length > 0 ) {
                    if( !item.powers )
                        item.powers = [];
                    for( var k=0; k<item_powers[0].length; k++ ) {
                        item.powers.push(item_powers[0][k].textContent);
                    }
                if( !char_exists )
                    current_vals[rules_elements[0][j].attributes['name'].value] = 0;
                }
                if( item_properties[0].length > 0 ) {
                    if( !item.properties )
                        item.properties = [];
                    for( var k=0; k<item_properties[0].length; k++ ) {
                        item.properties.push(item_properties[0][k].textContent);
                    }                
                }
                items.push(item);
            }
        }
    }

    // get the list of powers
    powers = [];
    var power = {};
    var weapon = {}, weapons, weapon_list;
    var power_elements = d3.select(xml).selectAll('Power');
    for( var i=0; i<power_elements[0].length; i++ ) {
        
        power = {};
        power['name'] = power_elements[0][i].attributes['name'].value;
        // get the specifics
        specifics = d3.select(power_elements[0][i]).selectAll('specific');
        for( var j=0; j<specifics[0].length; j++ ) {
            power[specifics[0][j].attributes['name'].value] = specifics[0][j].textContent;
        }
        weapons = d3.select(power_elements[0][i]).selectAll('Weapon');
        weapon_list = [];
        for( var j=0; j<weapons[0].length; j++ ) {
            weapon = {};
            weapon['name'] = weapons[0][j].attributes['name'].value;
            weapon['attackbonus'] = d3.select(weapons[0][j]).select('AttackBonus').node().textContent;
            weapon['damage'] = d3.select(weapons[0][j]).select('Damage').node().textContent;
            weapon['attackstat'] = d3.select(weapons[0][j]).select('AttackStat').node().textContent;
            weapon['defense'] = d3.select(weapons[0][j]).select('Defense').node().textContent;
            weapon_list.push(weapon);
        }
        power['weapons'] = weapon_list;

        if( !char_exists )
            current_vals[power['name']] = 0;

        powers.push(power);

    }

    localStorage[current_file] = JSON.stringify(current_vals);

    // init the window
    d3.selectAll(document.body.childNodes).remove();
    
    init_sidebar();
    init_reset_box();
    init_power_box();
    
    return 0;
    
}

function init_reset_box() {

    var reset_box = d3.select('body').append('div')
        .attr('class','reset_box')
        .style('position','absolute')
        .style('top','0px')
        .style('left',(SIDEBAR_W+15)+'px')
        .style('right','0px')
        .style('height',RESET_H+'px')
        .style('font-family','arial')
        .style('font-weight','bold')
        .style('font-size','17px')
        .style('color','#fff')
        .style('background-color','#aaa');

    reset_box.append('div')
        .style('display','inline-block')
        .style('margin','5px')
        .style('padding','5px 10px')
        .style('height',(RESET_H-20)+'px')
        .style('background-color','#555')
        .style('text-align','center')
        .style('cursor','pointer')
        .text('Short Rest')
        .on('click',end_encounter);
    reset_box.append('div')
        .style('display','inline-block')
        .style('margin','5px')
        .style('padding','5px 10px')
        .style('height',(RESET_H-20)+'px')
        .style('background-color','#555')
        .style('text-align','center')
        .style('cursor','pointer')
        .text('Extended Rest')
        .on('click',extended_rest);

    var box = reset_box.append('div')
        .style('display','inline-block')
        .style('font-weight','normal')
        .style('font-size','15px')
        .style('background-color','#555')
        .style('margin','0px 5px')
        .style('padding','2px 5px')
        .text('Columns: ');    
    box.append('input')
        .attr('class','col_num_input')
        .attr('type','number')
        .attr('min',1)
        .attr('max',10)
        .attr('value',N_POWER_COLS)
        .style('width','40px')
        .style('border-style','none')
        .on('change',change_columns);
    
    var box = reset_box.append('div')
        .style('display','inline-block')
        .style('font-weight','bold')
        .style('font-size','17px')
        .style('background-color','#555')
        .style('margin','5px')
        .style('padding','5px 10px')
        .style('width','130px')
        .style('height',(RESET_H-20)+'px')
        .style('vertical-align','top')
        .style('overflow','hidden');
    box.append('div')
        .style('display','inline-block')
        //.style('position','relative')
        //.style('top','0px')
        //.style('left','0px')
        .style('text-align','center')
        .style('width','130px')
        .text('Load Character');
    box.append('input')
        .attr('class','character_file_input')
        .attr('type','file')
        .style('display','inline-block')
        .style('position','relative')
        .style('left','0px')
        .style('top','-22px')
        .style('width','130px')
        .style('opacity','0')
        .on('change',change_character);
    
}

function init_power_box() {

    POWER_BOX_W = window.innerWidth-(SIDEBAR_W+15)-15;
    var col_height = 1.4*(POWER_BOX_W-5*(N_POWER_COLS+1))/N_POWER_COLS;
    var power_w = (POWER_BOX_W-5*(N_POWER_COLS+1))/N_POWER_COLS;

    var power_box = d3.select('body').append('div')
        .attr('class','power_box')
        .style('position','absolute')
        .style('top',RESET_H+'px')
        .style('left',(SIDEBAR_W+15)+'px')
        .style('right','0px')
        .style('bottom','0px')
        .style('background-color','#555')
        .style('overflow-y','scroll')
        .style('font-family','sans-serif')
        .style('color','#fff')
        .data([{minimized:false}]);

    var power, power_color;

    // create the conditions/notes "power"
    power = power_box.append('div').attr('class','power notes')
        .style('width',power_w+'px')
        .style('height',col_height+'px')
        .style('display','inline-block')
        .style('background-color','#aaa')
        .style('font-size','12px')
        .style('overflow-y','auto')
        .style('vertical-align','top')
        .style('position','relative');
    power.style('margin','5px 0px 5px 5px');

    power.append('div')
        .attr('class','power_name')
        .style('font-weight','bold')
        .style('text-align','center')
        .style('font-size','15px')
        .style('cursor','pointer')
        .style('margin','5px 5px 5px 5px')
        .style('background-color','#555')
        .on('click',minimize_powers)
        .text('Conditions');

    power.append('div')
        .attr('class','conditions')
        .style('margin','0px 5px 2px 5px');

    var new_remove_buttons = power.append('div')
        .style('text-align','center')
        .style('margin','0px 5px 2px 5px');
    new_remove_buttons.append('div')
        .style('display','inline-block')
        .style('text-align','center')
        .style('font-size','15px')
        .style('cursor','pointer')
        .style('margin','0px 5px 2px 5px')
        .style('padding','5px 10px')
        .style('background-color','#555')
        .text('New Condition')
        .on('click',new_condition);
    new_remove_buttons.append('div')
        .style('display','inline')
        .style('text-align','center')
        .style('font-size','15px')
        .style('cursor','pointer')
        .style('margin','5px 5px 2px 5px')
        .style('padding','5px 10px')
        .style('background-color','#555')
        .text('Remove All')
        .on('click',remove_all_conditions);
    
    power.append('div')
        .style('font-weight','bold')
        .style('text-align','center')
        .style('font-size','15px')
        .style('margin','5px 5px 2px 5px')
        .style('background-color','#555')
        .text('Notes');
    power.append('div')
        .style('margin','5px 15px 2px 10px')
        .append('textarea')
        .attr('rows','12')
        .style('width','100%')
        .style('resize','none')
        .style('font-family','sans-serif')
        .style('border-style','none');

    // fill in character powers
    for( var i=0; i<powers.length; i++ ) {

        power = power_box.append('div').attr('class','power')
            .style('width',power_w+'px')
            .style('height',col_height+'px')
            .style('display','inline-block')
            .style('background-color','#aaa')
            .style('font-size','12px')
            .style('overflow-y','auto')
            .style('vertical-align','top')
            .style('position','relative');
        if( (i+1)/N_POWER_COLS < 1 )
            power.style('margin','5px 0px 5px 5px');
        else
            power.style('margin','0px 0px 5px 5px');
        power.data([powers[i]]);

        power_color = '#000';
        if( powers[i]['Power Usage'] == ' At-Will ' )
            power_color = '#5a5';
        else if( powers[i]['Power Usage'] == ' Encounter ' )
            power_color = '#a55';
        else if( powers[i]['Power Usage'] == ' Encounter (Special) ' )
            power_color = '#a55';
        else if( powers[i]['Power Usage'] == ' Daily ' )
            power_color = '#777';

        if( powers[i]['Power Usage'] != ' At-Will ' ) {
            power.append('div')
                .attr('class','used_tally')
                .style('display','inline-block')
                .style('float','left')
                .style('margin','5px 0px 2px 5px')
                .style('padding','0px 0px 0px 5px')
                .style('text-align','left')
                .style('font-size','15px')
                .style('cursor','pointer')
                .style('background-color',power_color)
                .text('x'+current_vals[powers[i]['name']])
                .on('dblclick',function(d,i) {
                        clearTimeout(timer);
                        var element = this;
                        update_val(element,'set',d,i);
                    })
                .on('click',function(d,i) {
                        var element = this;
                        if (timer) clearTimeout(timer);
                        timer = setTimeout(function() { 
                                update_val(element,'increment',d,i);
                            }, 250);
                    });
            power.append('div')
                .attr('class','power_name')
                .style('font-weight','bold')
                .style('text-align','center')
                .style('font-size','15px')
                .style('margin','5px 5px 2px 5px')
                .style('cursor','pointer')
                .style('background-color',power_color)
                .on('click',minimize_powers)
                .text(powers[i]['name']);
        } else {
            power.append('div')
                .attr('class','power_name')
                .style('font-weight','bold')
                .style('text-align','center')
                .style('font-size','15px')
                .style('cursor','pointer')
                .style('margin','5px 5px 2px 5px')
                .style('background-color',power_color)
                .on('click',minimize_powers)
                .text(powers[i]['name']);
        }

        power.append('div')
            .style('text-align','center')
            .style('font-size','12px')
            .style('color','black')
            .style('padding','2px 0px 0px 0px')
            .style('font-weight','bold')
            .text(powers[i]['Action Type']);

        var box = power.append('div')
            .style('margin','5px')
            .style('background-color','#555');
        box.append('div')
            .style('display','inline-block')
            .style('vertical-align','middle')
            .style('width','44%')
            .style('text-align','right')
            .style('padding','0px 2% 2px 0px')
            .html(powers[i]['Attack Type']);
        box.append('div')
            .style('display','inline-block')
            .style('vertical-align','middle')
            .style('width','4%')
            .style('padding','0px 0px 2px 0px')
            .style('text-align','center')
            .html('&#9830');
        box.append('div')
            .style('display','inline-block')
            .style('vertical-align','middle')
            .style('width','44%')
            .style('text-align','left')
            .style('padding','0px 0px 2px 2%')
            .html(powers[i]['Target']);

        if( powers[i]['weapons'] ) {
            box = power.append('div')
                .style('margin','5px');
            var htmlText = '';
            for( var j=0; j<powers[i]['weapons'].length; j++ ) {
                htmlText += '<b>'+powers[i]['weapons'][j]['name']+':</b> ';
                htmlText += '+'+powers[i]['weapons'][j]['attackbonus']+' vs. '+powers[i]['weapons'][j]['defense']+', ';
                htmlText += powers[i]['weapons'][j]['damage']+' damage.';
                if( j < powers[i]['weapons'].length-1 )
                    htmlText += '<br />';
            }
            box.html(htmlText);
        }

        box = power.append('div')
            .style('margin','5px')
            .style('padding','0px 5px')
            .style('background-color','#555')
            .html('<b>Keywords</b>: '+powers[i]['Keywords']);

        var count=0;
        for( prop in powers[i] ) {
            
            if( prop == 'Keywords' || 
                prop == 'name' || 
                prop == 'Action Type' ||
                prop == 'Power Usage' ||
                prop == 'Flavor' || 
                prop == 'Display' || 
                prop == 'Attack Type' || 
                prop == 'Target' ||
                prop == 'weapons' ||
                prop == 'Class' || 
                prop == 'Level' ||
                prop == 'Power Type' ||
                prop[0] == '_' )
                continue;
            
            var box_color;
            if( count%2 == 1 )
                box_color = '#777';
            else
                box_color = '#aaa';
            box = power.append('div')
                .style('text-align','justify')
                .style('margin','5px')
                .style('background-color',box_color)
                .html('<b>'+prop+'</b>: '+powers[i][prop]);
            if( count%2 == 1 )
                box.style('padding','0px 5px');

            count = count+1;

        }
        
    }

    // fill in item powers
    for( var i=0; i<items.length; i++ ) {
        
        power = power_box.append('div').attr('class','power')
            .style('width',power_w+'px')
            .style('height',col_height+'px')
            .style('display','inline-block')
            .style('background-color','#aaa')
            .style('font-size','12px')
            .style('overflow-y','auto')
            .style('vertical-align','top')
            .style('position','relative');
        if( (i+1+powers.length)/N_POWER_COLS < 1 )
            power.style('margin','5px 0px 5px 5px');
        else
            power.style('margin','0px 0px 5px 5px');
        power.data([items[i]]);
        
        power_color = '#ff8c00';

        if( items[i].powers ) {
            power.append('div')
                .attr('class','used_tally')
                .style('display','inline-block')
                .style('float','left')
                .style('margin','5px 0px 2px 5px')
                .style('padding','0px 0px 0px 5px')
                .style('text-align','left')
                .style('font-size','15px')
                .style('cursor','pointer')
                .style('background-color',power_color)
                .text('x'+current_vals[items[i]['name']])
                .on('dblclick',function(d,i) {
                        clearTimeout(timer);
                        var element = this;
                        update_val(element,'set',d,i);
                    })
                .on('click',function(d,i) {
                        var element = this;
                        if (timer) clearTimeout(timer);
                        timer = setTimeout(function() { 
                                update_val(element,'increment',d,i);
                            }, 250);
                    });
            power.append('div')
                .attr('class','power_name')
                .style('font-weight','bold')
                .style('text-align','center')
                .style('font-size','15px')
                .style('margin','5px 5px 2px 5px')
                .style('cursor','pointer')
                .style('background-color',power_color)
                .on('click',minimize_powers)
                .text(items[i]['name']);
        } else {
            power.append('div')
                .attr('class','power_name')
                .style('font-weight','bold')
                .style('text-align','center')
                .style('font-size','15px')
                .style('cursor','pointer')
                .style('margin','5px 5px 2px 5px')
                .style('background-color',power_color)
                .on('click',minimize_powers)
                .text(items[i]['name']);
        }

        var count = 0;
        if( items[i].properties ) {

            for( var j=0; j<items[i].properties.length; j++ ) {
                box = power.append('div')
                    .style('margin','5px')
                    .style('padding','0px 5px')
                    .style('text-align','justify')
                    .html('<b>Property</b>: '+items[i].properties[j]);
                if( count%2 == 0 )
                    box.style('background-color','#aaa');
                else
                    box.style('background-color','#777');
                count += 1;
            }

        }

        if( items[i].powers ) {
            
            for( var j=0; j<items[i].powers.length; j++ ) {
                box = power.append('div')
                    .style('margin','5px')
                    .style('padding','0px 5px')
                    .style('text-align','justify')
                    .text(items[i].powers[j]);
                if( count%2 == 0 )
                    box.style('background-color','#aaa');
                else
                    box.style('background-color','#777');
                count += 1;
            }

        }

    }
    
}

function new_condition() {
    
    var condition = d3.select('.conditions').append('div')
        .style('background-color','#777')
        .style('margin','0px 0px 5px 0px');

    condition.append('span')
        .style('padding','2px 5px')
        .style('font-weight','bold')
        .style('background-color','#555')
        .style('margin','0px 5px')
        .style('cursor','pointer')
        .text('X')
        .on('click',remove_condition);

    condition.append('input')
        .attr('type','number')
        .attr('min',-99).attr('max',99)
        .attr('value','')
        .attr('size',3)
        .style('border-style','none')
        .style('width','2.75em')
        .style('text-align','right');

    var select = condition.append('select')
        .style('width','7em')
        .style('margin-left','4px');
    select.append('option').attr('value','').text('');
    select.append('option').attr('value','blinded').text('Blinded');
    select.append('option').attr('value','concealment').text('Concealment');
    select.append('option').attr('value','dazed').text('Dazed');
    select.append('option').attr('value','deafened').text('Deafened');
    select.append('option').attr('value','dominated').text('Dominated');
    select.append('option').attr('value','grabbed').text('Grabbed');
    select.append('option').attr('value','helpless').text('Helpless');
    select.append('option').attr('value','hidden').text('Hidden');
    select.append('option').attr('value','immobilized').text('Immobilized');
    select.append('option').attr('value','insubstantial').text('Insubstantial');
    select.append('option').attr('value','marked').text('Marked');
    select.append('option').attr('value','partialcover').text('Partial Cover');
    select.append('option').attr('value','petrified').text('Petrified');
    select.append('option').attr('value','phasing').text('Phasing');
    select.append('option').attr('value','prone').text('Prone');
    select.append('option').attr('value','restrained').text('Restrained');
    select.append('option').attr('value','slowed').text('Slowed');
    select.append('option').attr('value','stunned').text('Stunned');
    select.append('option').attr('value','superiorcover').text('Superior Cover');
    select.append('option').attr('value','totalconcealment').text('Total Concealment');
    select.append('option').attr('value','unconcious').text('Unconcious');
    select.append('option').attr('value','weakened').text('Weakened');
    select.append('option').attr('value','defenses').text('Defenses');
    select.append('option').attr('value','ac').text('AC');
    select.append('option').attr('value','fort').text('Fort');
    select.append('option').attr('value','ref').text('Ref');
    select.append('option').attr('value','will').text('Will');
    select.append('option').attr('value','hit').text('Hit');
    select.append('option').attr('value','damage').text('Damage');
    select.append('option').attr('value','saving').text('Saving Throws');
    select.append('option').attr('value','ongoing').text('Ongoing');
    select.append('option').attr('value','resist').text('Resist');
    select.append('option').attr('value','vulnerable').text('Vulnerable');

    condition.append('span')
        .style('padding','0px 5px')
        .text('until');

    condition.append('input')
        .attr('type','text')
        .style('border-style','none');

}

function remove_all_conditions() {

    var condition = d3.select('.conditions').selectAll('div').remove();

}

function remove_condition() {
    
    d3.select(this.parentElement).remove();
    
}

function init_sidebar() {

    var sidebar = d3.select('body').append('div')
        .attr('class','sidebar')
        .style('position','absolute')
        .style('top','0px')
        .style('left','0px')
        .style('width',(SIDEBAR_W+15)+'px')
        .style('background-color','#aaa')
        .style('height','100%')
        .style('overflow-y','scroll');
    
    /********** make name/abilities/defenses box **********/

    // name
    var name_box = sidebar.append('div')
        .style('margin','10px')
        .style('padding','5px')
        .style('background-color','#555')
        .style('text-align','center')
        .style('color','#fff')
        .style('font-family','sans-serif')
        .style('font-weight','bold')
        .style('font-size','20px')
        .style('overflow','hidden')
        .data([{visible:true}]);

    name_box.append('div')
        .style('margin','0px 0px 5px 0px')
        .style('background-color','#777')
        .style('height','5px')
        .style('cursor','pointer')
        .on('click',minimize_sidebar_item);

    name_box.append('div')
        .attr('margin','0px')
        .text(name);

    // ability names
    name_box.append('div')
        .style('width','25%')
        .style('text-align','right')
        .style('font-size','15px')
        .style('line-height','17px')
        .style('display','inline-block')
        .html('STR&nbsp;<br/>CON&nbsp;<br/>DEX&nbsp;<br/>INT&nbsp;<br/>WIS&nbsp;<br/>CHA&nbsp;');
    name_box.append('div')
        .style('width','25%')
        .style('text-align','left')
        .style('font-size','15px')
        .style('line-height','17px')
        .style('font-weight','normal')
        .style('display','inline-block')
        .html('&nbsp;'+abilities['str']+'<br/>&nbsp;'+abilities['con']+'<br/>&nbsp;'+abilities['dex']+'<br/>&nbsp;'+abilities['int']+'<br/>&nbsp;'+abilities['wis']+'<br/>&nbsp;'+abilities['cha']);
    name_box.append('div')
        .style('width','30%')
        .style('text-align','right')
        .style('font-size','15px')
        .style('line-height','17px')
        .style('display','inline-block')
        .html('AC&nbsp;<br/>Fort&nbsp;<br/>Ref&nbsp;<br/>Will&nbsp;<br/>Init&nbsp;<br/>Speed&nbsp;');
    name_box.append('div')
        .style('width','20%')
        .style('text-align','left')
        .style('font-size','15px')
        .style('line-height','17px')
        .style('font-weight','normal')
        .style('display','inline-block')
        .html('&nbsp;'+defenses['ac']+'<br/>&nbsp;'+defenses['fort']+'<br/>&nbsp;'+defenses['ref']+'<br/>&nbsp;'+defenses['will']+'<br/>&nbsp;'+init+'<br/>&nbsp;'+speed);

    /********** make health/ap box **********/
    var health_box  = sidebar.append('div')
        .style('margin','0px 10px 10px 10px')
        .style('padding','5px')
        .style('background-color','#555')
        .style('color','#fff')
        .style('font-family','sans-serif')
        .style('font-weight','normal')
        .style('font-size','15px')
        .style('overflow','hidden')
        .data([{visible:true}]);

    health_box.append('div')
        .style('margin','0px 0px 5px 0px')
        .style('background-color','#777')
        .style('height','5px')
        .style('cursor','pointer')
        .on('click',minimize_sidebar_item);

    health_box.append('div')
        .style('display','inline-block')
        .style('width','75%')
        .style('text-align','left')
        .style('background-color','#777')
        .html('&nbsp;Current HP');            
    health_box.append('div').attr('class','current_hp')
        .style('display','inline-block')
        .style('width','25%')
        .style('text-align','right')
        .style('background-color','#777')
        .style('cursor','pointer')
        .attr('title','Click to enter change, double click to add surge value.')
        .html(current_vals.current_hp+'&nbsp;')
        .on('dblclick',function(d,i){
                    clearTimeout(timer);
                    var element = this;
                    add_surge(element,d,i);
            })
        .on('click',function(d,i) {
                var element = this;
                if (timer) clearTimeout(timer);
                timer = setTimeout(function() { 
                        update_val(element,'difference',d,i);
                    }, 250);
            });
    
    health_box.append('div')
        .style('display','inline-block')
        .style('width','75%')
        .style('text-align','left')
        .style('background-color','#555')
        .html('&nbsp;Temp HP');            
    health_box.append('div').attr('class','temp_hp')
        .style('display','inline-block')
        .style('width','25%')
        .style('text-align','right')
        .style('background-color','#555')
        .style('cursor','pointer')
        .attr('title','Click to enter change.')
        .html(current_vals.temp_hp+'&nbsp;')
        .on('click',function(d,i) {
                var element = this;
                update_val(element,'difference',d,i);
            });

    health_box.append('div')
        .style('display','inline-block')
        .style('width','75%')
        .style('text-align','left')
        .style('background-color','#777')
        .html('&nbsp;Maximum HP');            
    health_box.append('div').attr('class','max_hp')
        .style('display','inline-block')
        .style('width','25%')
        .style('text-align','right')
        .style('background-color','#777')
        .html(max_hp+'&nbsp;');

    health_box.append('div')
        .style('display','inline-block')
        .style('width','75%')
        .style('text-align','left')
        .style('background-color','#555')
        .html('&nbsp;Surge Value');            
    health_box.append('div').attr('class','surge_value')
        .style('display','inline-block')
        .style('width','25%')
        .style('text-align','right')
        .style('background-color','#555')
        .html(surge_value+'&nbsp;');

    health_box.append('div')
        .style('display','inline-block')
        .style('width','80%')
        .style('text-align','left')
        .style('background-color','#777')
        .html('&nbsp;Number of Surges');            
    health_box.append('div').attr('class','num_surges')
        .style('display','inline-block')
        .style('width','20%')
        .style('text-align','right')
        .style('background-color','#777')
        .style('cursor','pointer')
        .attr('title','Click to subtract 1, double click to set.')
        .html(current_vals.num_surges+'&nbsp;')
        .on('dblclick',function(d,i) {
                clearTimeout(timer);
                var element = this;
                update_val(element,'set',d,i);
            })
        .on('click',function(d,i) {
                var element = this;
                if (timer) clearTimeout(timer);
                timer = setTimeout(function() { 
                        update_val(element,'decrement',d,i);
                    }, 250);
            });

    health_box.append('div')
        .style('display','inline-block')
        .style('width','75%')
        .style('text-align','left')
        .style('background-color','#555')
        .html('&nbsp;Action Points');            
    health_box.append('div').attr('class','action_points')
        .style('display','inline-block')
        .style('width','25%')
        .style('text-align','right')
        .style('background-color','#555')
        .style('cursor','pointer')
        .attr('title','Click to subtract 1, double click to set.')
        .html(current_vals.action_points+'&nbsp;')
        .on('dblclick',function(d,i) {
                clearTimeout(timer);
                var element = this;
                update_val(element,'set',d,i);
            })
        .on('click',function(d,i) {
                var element = this;
                if (timer) clearTimeout(timer);
                timer = setTimeout(function() { 
                        update_val(element,'decrement',d,i);
                    }, 250);
            });

    /********** make skills box *********/
    var skills_box = sidebar.append('div')
        .style('margin','0px 10px 10px 10px')
        .style('padding','5px')
        .style('background-color','#555')
        .style('color','#fff')
        .style('font-family','sans-serif')
        .style('font-weight','normal')
        .style('font-size','15px')
        .style('overflow','hidden')
        .data([{'visible':true}]);

    skills_box.append('div')
        .style('margin','0px 0px 5px 0px')
        .style('background-color','#777')
        .style('height','5px')
        .style('cursor','pointer')
        .on('click',minimize_sidebar_item);

    var i=0, b_color;
    for( var skill_name in skills ) {

        if( i%2 == 0 ) b_color = '#777';
        else b_color = '#555';

        skills_box.append('div')
            .style('display','inline-block')
            .style('width','75%')
            .style('text-align','left')
            .style('background-color',b_color)
            .html('&nbsp;'+skill_name);            
        skills_box.append('div')
            .style('display','inline-block')
            .style('width','25%')
            .style('text-align','right')
            .style('background-color',b_color)
            .html(skills[skill_name]+'&nbsp;');

        i = i+1;
    }

    /********** make feats box *********/
    var feats_box = sidebar.append('div')
        .style('margin','0px 10px 10px 10px')
        .style('padding','5px')
        .style('background-color','#555')
        .style('color','#fff')
        .style('font-family','sans-serif')
        .style('font-weight','normal')
        .style('font-size','10px')
        .style('overflow','hidden')
        .data([{'visible':true}]);

    feats_box.append('div')
        .style('margin','0px 0px 5px 0px')
        .style('background-color','#777')
        .style('height','5px')
        .style('cursor','pointer')
        .on('click',minimize_sidebar_item);

    for( var i=0; i<feats.length; i++ ) {
        feats_box.append('div')
            .style('text-align','left')
            .style('font-weight','bold')
            .style('margin',(i>0?'5px':'0px')+' 0px 0px 0px')
            .html(feats[i]['name']);
        feats_box.append('div')
            .style('text-align','justify')
            .html(feats[i]['desc']);
        
    }

}

function add_surge(element,d,i) {

    if( element.attributes['class'].value == 'current_hp' ) {
        if( Number(surge_value)+Number(current_vals.current_hp) < Number(max_hp) )
            current_vals.current_hp = Number(current_vals.current_hp)+Number(surge_value);
        else current_vals.current_hp = max_hp;
        element.innerHTML = current_vals.current_hp+'&nbsp;';
    }

    localStorage[current_file] = JSON.stringify(current_vals);

}

function update_val(element,update_type,d,i) {

    if( update_type == "increment" ) {

        if( element.attributes['class'].value == 'current_hp' ) {
            if( 1+Number(current_vals.current_hp) < Number(max_hp) )
                current_vals.current_hp = Number(current_vals.current_hp)+1;
            else current_vals.current_hp = max_hp;
            element.innerHTML = current_vals.current_hp+'&nbsp;';
        } else if( element.attributes['class'].value == 'temp_hp' ) {
            if( Number(current_vals.temp_hp)+1 > 0 )
                current_vals.temp_hp = Number(current_vals.temp_hp)+1;
            else current_vals.temp_hp = 0;
            element.innerHTML = current_vals.temp_hp+'&nbsp;';
        } else if( element.attributes['class'].value == 'num_surges' ) {
            if( Number(current_vals.num_surges)+1 > 0 )
                current_vals.num_surges = Number(current_vals.num_surges)+1;
            else current_vals.num_surges = 0;
            element.innerHTML = current_vals.num_surges+'&nbsp;';
        } else if( element.attributes['class'].value == 'action_points' ) {
            if( Number(current_vals.action_points)+1 > 0 )
                current_vals.action_points = Number(current_vals.action_points)+1;
            else current_vals.action_points = 0;
            element.innerHTML = current_vals.action_points+'&nbsp;';
        } else if( element.attributes['class'].value == 'used_tally' ) {
            if( Number(current_vals[d['name']])+1 < 0 )
                current_vals[d['name']] = 0;
            else
                current_vals[d['name']] = Number(current_vals[d['name']])+1;
            element.innerHTML = 'x'+current_vals[d['name']];
        }
        
    } else if( update_type == "decrement" ) {

        if( element.attributes['class'].value == 'current_hp' ) {
            if( Number(current_vals.current_hp)-1 < Number(max_hp) )
                current_vals.current_hp = Number(current_vals.current_hp)-1;
            else current_vals.current_hp = max_hp;
            element.innerHTML = current_vals.current_hp+'&nbsp;';
        } else if( element.attributes['class'].value == 'temp_hp' ) {
            if( Number(current_vals.temp_hp)-1 > 0 )
                current_vals.temp_hp = Number(current_vals.temp_hp)-1;
            else current_vals.temp_hp = 0;
            element.innerHTML = current_vals.temp_hp+'&nbsp;';
        } else if( element.attributes['class'].value == 'num_surges' ) {
            if( Number(current_vals.num_surges)-1 > 0 )
                current_vals.num_surges = Number(current_vals.num_surges)-1;
            else current_vals.num_surges = 0;
            element.innerHTML = current_vals.num_surges+'&nbsp;';
        } else if( element.attributes['class'].value == 'action_points' ) {
            if( Number(current_vals.action_points)-1 > 0 )
                current_vals.action_points = Number(current_vals.action_points)-1;
            else current_vals.action_points = 0;
            element.innerHTML = current_vals.action_points+'&nbsp;';
        } else if( element.attributes['class'].value == 'used_tally' ) {
            if( Number(current_vals[d['name']])-1 < 0 )
                current_vals[d['name']] = 0;
            else
                current_vals[d['name']] = Number(current_vals[d['name']])-1;
            element.innerHTML = 'x'+current_vals[d['name']];
        }
        
    } else if( update_type == "difference" ) {

        var alert_text, default_val;
        if( element.attributes['class'].value == 'current_hp' ) {
            alert_text = "Enter current HP difference";
            default_value = 0;
        } else if( element.attributes['class'].value == 'temp_hp' ) {
            alert_text = "Enter temp HP difference";
            default_value = 0;
        } else if( element.attributes['class'].value == 'num_surges' ) {
            alert_text = "Enter surge number difference";
            default_value = -1;
        } else if( element.attributes['class'].value == 'action_points' ) {
            alert_text = "Enter action point difference";
            default_value = -1;
        } else if( element.attributes['class'].value == 'used_tally' ) {
            alert_text = "Enter used tally difference";
            default_value = 1;
        }
        
        var prompt_value = prompt(alert_text,default_value);
        
        if( isNaN(parseInt(prompt_value)) || !isFinite(prompt_value) )
            return;
        
        if( element.attributes['class'].value == 'current_hp' ) {
            if( Number(prompt_value)+Number(current_vals.current_hp) < Number(max_hp) )
                current_vals.current_hp = Number(current_vals.current_hp)+Number(prompt_value);
            else current_vals.current_hp = max_hp;
            element.innerHTML = current_vals.current_hp+'&nbsp;';
        } else if( element.attributes['class'].value == 'temp_hp' ) {
            if( Number(current_vals.temp_hp)+Number(prompt_value) > 0 )
                current_vals.temp_hp = Number(current_vals.temp_hp)+Number(prompt_value);
            else current_vals.temp_hp = 0;
            element.innerHTML = current_vals.temp_hp+'&nbsp;';
        } else if( element.attributes['class'].value == 'num_surges' ) {
            if( Number(current_vals.num_surges)+Number(prompt_value) > 0 )
                current_vals.num_surges = Number(current_vals.num_surges)+Number(prompt_value);
            else current_vals.num_surges = 0;
            element.innerHTML = current_vals.num_surges+'&nbsp;';
        } else if( element.attributes['class'].value == 'action_points' ) {
            if( Number(current_vals.action_points)+Number(prompt_value) > 0 )
                current_vals.action_points = Number(current_vals.action_points)+Number(prompt_value);
            else current_vals.action_points = 0;
            element.innerHTML = current_vals.action_points+'&nbsp;';
        } else if( element.attributes['class'].value == 'used_tally' ) {
            if( Number(current_vals[d['name']])+Number(prompt_value) < 0 )
                current_vals[d['name']] = 0;
            else
                current_vals[d['name']] = Number(current_vals[d['name']])+Number(prompt_value);
            element.innerHTML = 'x'+current_vals[d['name']];
        }

    } else if( update_type == 'set' ) {

        var alert_text, default_val;
        if( element.attributes['class'].value == 'current_hp' ) {
            alert_text = "Enter current HP";
            default_value = max_hp;
        } else if( element.attributes['class'].value == 'temp_hp' ) {
            alert_text = "Enter temp HP";
            default_value = 0;
        } else if( element.attributes['class'].value == 'num_surges' ) {
            alert_text = "Enter number of surges";
            default_value = surges_per_day;
        } else if( element.attributes['class'].value == 'action_points' ) {
            alert_text = "Enter number of action points";
            default_value = 1;
        } else if( element.attributes['class'].value == 'used_tally' ) {
            alert_text = "Enter used tally";
            default_value = 0;
        }
        
        var prompt_value = prompt(alert_text,default_value);
        
        if( isNaN(parseInt(prompt_value)) || !isFinite(prompt_value) )
            return;
        
        if( element.attributes['class'].value == 'current_hp' ) {
            if( Number(prompt_value) < Number(max_hp) )
                current_vals.current_hp = Number(prompt_value);
            else current_vals.current_hp = max_hp;
            element.innerHTML = current_vals.current_hp+'&nbsp;';
        } else if( element.attributes['class'].value == 'temp_hp' ) {
            if( Number(prompt_value) > 0 )
                current_vals.temp_hp = Number(prompt_value);
            else current_vals.temp_hp = 0;
            element.innerHTML = current_vals.temp_hp+'&nbsp;';
        } else if( element.attributes['class'].value == 'num_surges' ) {
            if( Number(prompt_value) > 0 )
                current_vals.num_surges = Number(prompt_value);
            else current_vals.num_surges = 0;
            element.innerHTML = current_vals.num_surges+'&nbsp;';
        } else if( element.attributes['class'].value == 'action_points' ) {
            if( Number(prompt_value) > 0 )
                current_vals.action_points = Number(prompt_value);
            else current_vals.action_points = 0;
            element.innerHTML = current_vals.action_points+'&nbsp;';
        } else if( element.attributes['class'].value == 'used_tally' ) {
            if( Number(prompt_value) < 0 )
                current_vals[d['name']] = 0;
            else
                current_vals[d['name']] = Number(prompt_value);
            element.innerHTML = 'x'+current_vals[d['name']];
        }

    }
        
    localStorage[current_file] = JSON.stringify(current_vals);
    
}

function minimize_sidebar_item() {

    var box = d3.select(this.parentElement);
    if( box[0][0].__data__['visible'] ) {
        box.transition().duration(500)
            .style('height','5px');
        box[0][0].__data__['visible'] = false;
    } else {
        box.transition().duration(500)
            .style('height',(box[0][0].scrollHeight-10)+'px')
            .each('end',function(){box.style('height','auto');});
        box[0][0].__data__['visible'] = true;
    }
    
}

function minimize_powers() {

    var minimized = d3.select('.power_box')[0][0].__data__['minimized'];

    if( !minimized ) {
        
        d3.selectAll('.power').transition().duration(500)
            .style('height','28px')
            .style('overflow-y','hidden')
            .each('end',function(){this.scrollTop = 0;});
        //d3.selectAll('.power_name').transition().duration(500)
        //.style('height','17px')
        //.style('overflow-y','hidden');
        d3.select('.power_box')[0][0].__data__['minimized'] = true;
        
    } else {

        clicked_power = this;
        d3.selectAll('.power').transition().duration(500)
            .style('height',(1.4*(POWER_BOX_W-5*(N_POWER_COLS+1))/N_POWER_COLS)+'px')
            .each('end',function(){
                    d3.select(this).style('overflow-y','auto');
                    clicked_power.parentElement.parentElement.scrollTop = clicked_power.parentElement.offsetTop-clicked_power.offsetTop;
                });
        //d3.selectAll('.power_name').transition().duration(500)
        //.style('height','auto')
        //.style('overflow-y','hidden');

        d3.select('.power_box')[0][0].__data__['minimized'] = false;

    }

}

function end_encounter() {

    current_vals.temp_hp = 0;
    d3.select('div.temp_hp').html(current_vals.temp_hp+'&nbsp;');

    for( i=0; i<powers.length; i++ ) {
        if( powers[i]['Power Usage'] != ' Daily ' )
            current_vals[powers[i]['name']] = 0;
    }
    d3.selectAll('div.used_tally').filter(function(d,i){
            return d['Power Usage'] != ' Daily ';
        }).text('x0');

    localStorage[current_file] = JSON.stringify(current_vals);
}

function extended_rest() {

    current_vals.current_hp = max_hp;
    d3.select('div.current_hp').html(current_vals.current_hp+'&nbsp;');

    current_vals.temp_hp = 0;
    d3.select('div.temp_hp').html(current_vals.temp_hp+'&nbsp;');

    current_vals.num_surges = surges_per_day;
    d3.select('div.num_surges').html(current_vals.num_surges+'&nbsp;');

    current_vals.action_points = 1;
    d3.select('div.action_points').html(current_vals.action_points+'&nbsp;');

    for( i=0; i<powers.length; i++ ) {
        current_vals[powers[i]['name']] = 0;
    }
    d3.selectAll('div.used_tally').text('x0');

    localStorage[current_file] = JSON.stringify(current_vals);

}

function change_columns() {

    N_POWER_COLS = Number(this.value);
    var col_h = 1.4*(POWER_BOX_W-5*(N_POWER_COLS+1))/N_POWER_COLS;
    var power_w = (POWER_BOX_W-5*(N_POWER_COLS+1))/N_POWER_COLS;

    if( d3.select('.power_box')[0][0].__data__['minimized'] ) {
        d3.selectAll('.power').transition().duration(500)
            .style('width',power_w+'px')
            .style('margin',function(d,i){
                    if( i/N_POWER_COLS < 1 ) 
                        return '5px 0px 5px 5px';
                    else
                        return '0px 0px 5px 5px';
                });
    } else {
        d3.selectAll('.power').transition().duration(500)
            .style('height',col_h+'px')
            .style('width',power_w+'px')
            .style('margin',function(d,i){
                    if( i/N_POWER_COLS < 1 ) 
                        return '5px 0px 5px 5px';
                    else
                        return '0px 0px 5px 5px';
                });
    }
}

function change_character() {
    current_file = this.value.replace('C:\\fakepath\\','');
    localStorage.current_file = current_file;
    d3.xml('data/'+current_file,init_char);
}

if( localStorage.current_file ) {
    current_file = localStorage.current_file;
} else {
    current_file = 'default.dnd4e';
    localStorage.current_file = current_file;
}
d3.xml('data/'+current_file, 'text/xml', init_char);
