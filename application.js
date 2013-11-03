// TODO : 更新生日验证
// TODO : fix 免疫力 sports.description1 
// TODO : get advices for femail
// TODO : set sex on questions
function resize(){
	$('body').height($(window).height())
	$('body').append('<style>.question-outer{height:'+1080+'px}</style>')
}
function send(){
	var url = "http://121.199.30.35/userinfo/api_add.php";
	var rows = db.choices({id:get_answers_checked()})
	var answers = {}
	rows.each(function(row){
		if(answers[row.category]){
			answers[row.category].push(row.content)
		}else{
			answers[row.category] = [row.content]
		}
	})
	var myscore = compute_score_common();	
	var postData = "answers="+encodeURIComponent(JSON.stringify(answers))+"&name="+get_name()+"&phone="+get_phone()+"&birthday="+get_birthday()+"&sex="+get_sex()+"&score="+compute_score_common();
	$.ajax({
  	url:"http://127.0.0.1:8080/ajax/send_http_request",
  	type:'POST',
  	data: '{"url":"'+url+'","data":"'+(postData)+'","method":"POST"}',
  	success:function(json){
  	},
  	error:function(){
  	}
	});
}

String.prototype.trim=function() {  
    return this.replace(/(^\s*)|(\s*$)/g,'');  
};

function get_avg_score(score)
{
	var url = "http://121.199.30.35/userinfo/age_avg.php?age="+get_birthday();
	$.ajax({
  	url:"http://127.0.0.1:8080/ajax/send_http_request",
  	type:'POST',
  	data: '{"url":"'+url+'","method":"GET"}',
  	success:function(json){
  		var avg_str = json.substring(json.indexOf("\n"), json.lastIndexOf("\n"));
  		var score_average = parseFloat(avg_str.trim()).toFixed(1);
  		$(".other").attr('title','平均得分 '+score_average).css('left',(score_average-5)+"%").tooltip('show')
  		$(".score_average").text(score_average)
  		var better = Math.max(1,Math.min(50 + (score_average - score)*3,99)).toFixed(1)
  		$(".score_better").text(better)
  		if(score > score_average){
				$(".score_info.good").show()
			}else{
				$(".score_info.normal").show()
			}
  	},
  	error:function(){
  	}
	});
}

function get_score_details(){
	var birthday = get_birthday();	
	var score = compute_score_common();	
	if(score > 60){
	 score = (score *0.85).toFixed(1);
	}
	
	var year = birthday.split(/-/).length>0?parseInt(birthday.split(/-/)[0]):1980
	var average = Math.max(Math.min(86+( year- 1980)*0.5,100),50)
	var better = Math.max(1,Math.min(50 + (average - score)*3,99)).toFixed(1)
	return {
		average:average,
		better:better
	}
}

function show_basic_modal(){
	var msg = '';
	if(get_name()==''){
		msg+="<h3>请输入您的名字</h3>";
	}
	if(get_phone()==''){
		msg+="<h3>请输入您的手机号码</h3>";
	}
	if(get_sex()==''){
		msg+="<h3>请选择您的性别</h3>";
	}
	if(get_birthday()==''){
		msg+="<h3>请选择您的出生日期</h3>";
	}
	$('#myModal .modal-body').html(msg);
	$('#myModal').modal('show');	

}
function show_question_modal(){
	var msg = '<h3>请选择至少一条选项</h3>';
	$('#myModal .modal-body').html(msg);
	$('#myModal').modal('show');	

}
function update_score(){
	var score = compute_score_common();
	if(score > 60){
	 score = (score *0.85).toFixed(1);
	}
	
	get_avg_score(score);
	$(".your").attr('title','您的分数 '+score).css('left',(score-5)+"%").tooltip('show')
	$(".score_sub").text(score)
	$(".score").text(score);
}



// function get_advices(){
// 	var array = []
// 	$('#frameContent').contents().find('.section_title').each(function(){
// 		var section = $.trim($(this).text());
// 		$(this).nextUntil('.section_title').find('.section_content h4').each(function(){
// 			var title = $(this).text()
// 			$(this).nextUntil('h4').each(function(){
// 				array.push({
// 					section:section,
// 					title:title,
// 					content:$.trim($(this).text())
// 				})
// 			})
// 		})
// 	})
// 	return JSON.stringify(array)
// }

function get_advices_section(section){
	section = ''
	var array = []
	$('#frameContent').contents().find('.section_content h4').each(function(){
		var title = $(this).text()
		$(this).nextUntil('h4').each(function(){
			array.push({
				section:section,
				title:title,
				content:$.trim($(this).text())
			})
		})
	})
	return JSON.stringify(array)
}

function get_advices_sports(){
	var array = []
	var section = $.trim($('#frameContent').contents().find('.sport_questions h2').text());
	$('#frameContent').contents().find('.sport_questions h3').each(function(){
		var title = $(this).text()
		$(this).nextUntil('h3').each(function(){
			array.push({
				section:section,
				title:title,
				content:$.trim($(this).text())
			})
		})
	})
	return JSON.stringify(array)
}

function compute_level(branch,levels){
	var score = compute_score(branch)
	for (var i = 0; i <levels.length-1; i++) {
		if(score<levels[i]){
			return (i+1).toString()
		}
	}
	return (levels.length+1).toString()
}

function compute_level_beauty(){
	var levels = [50,70]
	return compute_level('容颜美好',levels)
}

function compute_level_body(){
	var levels = [50,70]
	return compute_level('优美体形',levels)
}

function compute_level_fading(){
	var levels = [50,70]
	return compute_level('抗衰老方面',levels)
}

function compute_level_immunity(){
	var levels = [50,70]
	return compute_level('免疫力方面',levels)
}

function compute_level_energy(){
	var levels = [40,60,80]
	return compute_level('精力脑力',levels)
}

function compute_level_common(){
	var levels = [50,70]
	return compute_level('common',levels)
}

function compute_score(branch){
	var choices_total = db.choices({branch:branch})
	var choices_checked = db.choices({branch:branch,id:get_answers_checked()})	
	var total = 0;
	choices_total.each(function(choice){
		total += choice.score
	})
	var checked = 0;
	choices_checked.each(function(choice){
		checked += choice.score
	})
	return ((total-checked)*100/total).toFixed(1)
}

function compute_score_beauty(){
	return compute_score('容颜美好')
}

function compute_score_body(){
	return compute_score('优美体形')
}

function compute_score_fading(){
	return compute_score('抗衰老方面')
}

function compute_score_immunity(){
	return compute_score('免疫力方面')
}

function compute_score_energy(){
	return compute_score('精力脑力')
}

function compute_score_common(){
	return compute_score('common')
}

function get_color_by_level(level){
	switch(parseInt(level)){
		case 1:return 'red';
		case 2:return 'orange';
		case 3:return 'yellow';
		case 4:return 'green';
	}
}

function get_name(){
	return $.trim($("#name").val())
}

function get_phone(){
	return $.trim($("#phone").val())
}

function get_birthday(){
	if($('#year').val()=='0' || $('#month').val()=='0' || $('#day').val()=='0'){
		return ''
	}
	return $('#year').val()+'-'+$('#month').val()+'-'+$('#day').val()
}

function get_sex(){
	var sex = '';
	if($("[name='sex']").eq(0).is(':checked')){
		sex = 'male'
	}
	if($("[name='sex']").eq(1).is(':checked')){
		sex = 'female'
	}
	return sex;
}

function get_advices(branch,tab_name){
	var answer_ids = get_answers_checked()
	var advices = [];
	var question_ids = []
	db.advices({branch:branch,tab:tab_name}).each(function(advice){
		
		if(_.intersection(advice.question_id,answer_ids).length>0 || advice.question_id == null){
			advices.push(advice)
		}
	})
	return advices
}

function get_advices_tree(branch,tab_name){
	var adviceses = {};
	var advices = get_advices(branch,tab_name);
	_.each(advices,function(advice){
		if(adviceses[advice.section]){
			if(adviceses[advice.section][advice.title]){
				adviceses[advice.section][advice.title].push(advice)
			}else{
				adviceses[advice.section][advice.title] = [advice]	
			}
		}else{
			adviceses[advice.section] = {}
			adviceses[advice.section][advice.title] = [advice]
		}
	})
	return adviceses
}


function get_answers(){
	var result = []
	$(".questions label[data-id]").each(function(){
		result.push({
			id:parseInt($(this).attr('data-id')),
			// question:$.trim($(this).parents('.question-inner').find(' .header').text()),
			// choice:$.trim($(this).text()),
			checked:$(this).find('input:first').is(':checked')
		})
	})
	return result;
}

function get_answers_checked(){
	var result = get_answers()
	result =_.filter(result,function(item){
	    return item.checked == true
	})
	return _.pluck(result,'id')
}

// get_answers_checked_ids = get_answers_checked

function get_bad_habits(){
	//TODO : get_bad_habits_by_results , this result is all bad habits now . 
	var answers = get_answers_checked()
	return db.choices({id:answers,bad_habit_title:{isNull:false}})
}

function create_tab_bad_habit(){
	if($('.panel.main div.bad_habit').length>0){
		return
	}
	var name = '坏习惯弥补';
	var branch = get_branch();
	var tab = db.tabs({branch:branch,name:name}).first()	

	var habits = get_bad_habits()
	$('.panel.main').append(_.template($("#bad_habit").html(),{tab:tab,habits:habits}))
}

function create_tab_life(){
	if($('.panel.main div.life').length>0){
		return
	}
	var name = '生活方式建议';
	var branch = get_branch();
	var tab = db.tabs({branch:branch,name:name}).first()
	var adviceses = get_advices_tree(branch,name)
	$('.panel.main').append(_.template($("#life").html(),{tab:tab,adviceses:adviceses}))
}

function get_sports(){
	var ids = []
	for(var i=0;i<4;i++){
		if(get_sex()=='male'){
			indice = [2,3,4,7,10,11,12]
		}else{
			indice = [1,5,6,8,9,13,14]
		}
		var id = indice[Math.floor(Math.random()*indice.length)]
		ids.push(id)
	}
	return db.sports({id:_.uniq(ids)})
}

function create_tab_sports(){
	if($('.panel.main div.sports').length>0){
		return
	}
	var name = '有效运动建议';
	var branch = get_branch();
	var tab = db.tabs({branch:branch,name:name}).first()
	var sports = get_sports()
	var adviceses = get_advices_tree(branch,name);
	$('.panel.main').append(_.template($("#sports").html(),{tab:tab,sports:sports,adviceses:adviceses}))
}

function create_tab_beauty(){
	var cls = 'beauty'
	var tab_name = '容颜健康评估'
	var branch = get_branch();
	create_tab_base(cls,tab_name,branch,compute_level_beauty())
}
function create_tab_body(){
	var cls = 'body'
	var tab_name = '形体健康评估'
	var branch = get_branch();

	create_tab_base(cls,tab_name,branch)
}
function create_tab_immunity(){
	var cls = 'immunity'
	var tab_name = '免疫力评估'
	var branch = get_branch();
	var level = '1';
	create_tab_base(cls,tab_name,branch,compute_level_immunity())
}
function create_tab_energy(){
	var cls = 'energy'
	var tab_name = '精力脑力评估'
	var branch = get_branch();
	create_tab_base(cls,tab_name,branch,compute_level_energy())
}
function create_tab_fading(){
	var cls = 'fading'
	var tab_name = '抗衰老评估'
	var branch = get_branch();
	create_tab_base(cls,tab_name,branch,compute_level_fading())
}
function create_tab_basic(){
	var cls = 'basic'
	var tab_name = '基本健康评估'
	var branch = get_branch();
	create_tab_base(cls,tab_name,branch)
}
function create_tab_nutrition(){
	var cls = 'nutrition'
	var tab_name = '合理营养建议'
	var branch = get_branch();
	create_tab_base(cls,tab_name,branch)
}

function show_tab_beauty(){
	show_tab_base('beauty')
}

function show_tab_body(){
	show_tab_base('body')
}

function show_tab_fading(){
	show_tab_base('fading')
}

function show_tab_basic(){
	show_tab_base('basic')
}

function show_tab_immunity(){
	show_tab_base('immunity')
}

function show_tab_energy(){
	show_tab_base('energy')
}

function show_tab_bad_habit(){
	show_tab_base('bad_habit')
}

function show_tab_life(){
	show_tab_base('life')
}

function show_tab_sports(){
	show_tab_base('sports')
}

function show_tab_nutrition(){
	show_tab_base('nutrition')
}

function show_tab_base(cls){
	$('.panel.main .tab .btn').removeClass('btn-primary');
	$('.panel.main .tab .btn.'+cls).addClass('btn-primary');
	$('.panel.main div.tab_target').hide();
	$('.panel.main div.'+cls).show();
}


function create_tab_base(cls,tab_name,branch,level){
	if($('.panel.main div.'+cls).length>0){
		return
	}
	var tab = db.tabs({branch:branch,name:tab_name}).first()
	var adviceses = get_advices_tree(branch,tab_name)
//	console.log(adviceses)
	if(_.isUndefined(level)){
		level = null;
	}
	$('.panel.main').append(_.template($("#basic").html(),{cls:cls,tab:tab,adviceses:adviceses,level:level}))
	
}

function compute_bmi(height,weight){
	if(height<=0 || height >=300){
		return null;
	}
	if(weight<=0 || weight >=1000){
		return null;
	}
	return weight/(height/100)/(height/100).toFixed()
}

function bmi_status(height,weight){
	var value = compute_bmi(height,weight)
	var status ;	
	if(value==null){
		status = '您输入的数值无效'
	}else if(value<18.5){
		status = '属于身体偏瘦'
	}else if(value>=18.5 && value <23.9){
		status = '属于正常体重'
	}else if(value>=23.9 && value <27.9){
		status = '属于超重'
	}else if(value>=27.9 && value <38){
		status = '属于肥胖'
	}else if(value>=38){
		status = '属于极胖,建议您就医治疗！'
	}
	return status
}

function normal_weight(height){
	return (height-100)*0.9
}

function bmi_warning(){
	var bmi = compute_bmi(parseInt($("#height").val()),parseInt($("#weight").val()))

}

function create_print_tab_nutrition(){

	create_print_tab_base('合理营养建议')
}
function create_print_tab_sports(){
	create_print_tab_base('有效运动建议')
}
function create_print_tab_life(){
	create_print_tab_base('生活方式建议')
}
function create_print_tab_had_habit(){
	create_print_tab_base('坏习惯弥补')
}
function create_print_tab_beauty(){
	create_print_tab_base('容颜健康评估')
}
function create_print_tab_body(){
	create_print_tab_base('形体健康评估')
}
function create_print_tab_immunity(){
	create_print_tab_base('免疫力评估')
}
function create_print_tab_energy(){
	create_print_tab_base('精力脑力评估')
}
function create_print_tab_fading(){
	create_print_tab_base('抗衰老评估')
}
function create_print_tab_basic(){
	create_print_tab_base('基础健康评估')
}
function create_print_tab_base(tab_name){
	var sports = null;
	if(tab_name=='有效运动建议'){
		sports = get_sports();
	}
	var branch = get_branch();
	var adviceses = get_advices_tree(branch,tab_name);
	var tab = db.tabs({branch:branch,name:tab_name}).first()	
	$('.container-fluid.print').append(_.template($("#print_tab").html(),{adviceses:adviceses,tab:tab,tab_name:tab_name,sports:sports}))
}
function create_print_base(){
	add_basic_info();
	create_print_tab_nutrition()
	create_print_tab_sports()
	create_print_tab_life()
	create_print_tab_had_habit()
}
function add_basic_info(){
	var sex = get_sex();
	if(sex=='male'){
		$('.print .sex').text('男')		
	}
	if(sex=='female'){
		$('.print .sex').text('女')		
	}	
	$('.print .name').text(get_name())
	
	var birthday = get_birthday();
	birthday = birthday.replace(':','年').replace(':','月')+'日'
	$('.print .birthday').text(birthday)		
}
function create_print_beauty(){
	create_print_tab_beauty()
	create_print_base()
}

function create_print_body(){
	create_print_tab_body()
	create_print_base()
}

function create_print_immunity(){
	create_print_tab_immunity()
	create_print_base()
}

function create_print_energy(){
	create_print_tab_energy()
	create_print_base()
}

function create_print_fading(){
	create_print_tab_fading()
	create_print_base()
}

function create_print_basic(){
	create_print_tab_basic()
	create_print_base()
}

function show_branch_beauty(){
	show_branch_base('beauty');
	create_tab_beauty()
	create_print_beauty()
	show_tab_beauty()

}

function show_branch_body(){
	show_branch_base('body')
	create_print_body()
	create_tab_body();
	show_tab_body()
}

function show_branch_immunity(){
	show_branch_base('immunity')
	create_print_immunity()
	create_tab_immunity()
	show_tab_immunity()
}

function show_branch_energy(){
	show_branch_base('energy')
	create_print_energy()
	create_tab_energy();
	show_tab_energy();
}

function show_branch_fading(){
	show_branch_base('fading')
	create_print_fading()
	create_tab_fading()
	show_tab_fading()
}

function show_branch_basic(){
	show_branch_base('basic')
	create_print_basic()
	create_tab_basic();
	show_tab_basic();
}

function show_branch_base(cls){
	$("."+cls).show()
	$('.result').show()

	create_tab_nutrition()
	create_tab_sports()
	create_tab_life()
	create_tab_bad_habit()
}

function short_branch(value){
	if(!value){
		return null;
	}
	switch(value){
		case '容颜美好':value='容颜美好';break;
		case '健康优美体形':value='优美体形';break;
		case '免疫力方面':value='免疫力方面';break;		
		case '充足的精力和脑力应对高要求生活':value='精力脑力';break;
		case '抗衰老方面':value='抗衰老方面';break;		
		case '没有特别关注的主题':value='没有关注';break;				
		default:value=value;						
	}
	return value;	
}

function get_branch(){
	var name = $("div[data-id=360]").attr('title');
	var value;
	$("div[data-id=360] [name='"+name+"']").each(function(){
		if($(this).is(':checked')){
			value = $(this).val();
		}
	})
	if(!value){
		value = '没有特别关注的主题'
	}
	return short_branch(value)
}

function create_questions(){
	db.questions().each(function(question){
		create_question(question)
	})
}

function prev_question(question_id){
	var next_question = null;
	if(question_id==null){
		return 
	}else if(question_id==360){
		next_question = db.questions({category:'容颜美好'}).first();
	}else{
		next_question = db.questions({id:{'>':question_id}}).first();
	}	
	$(".question-outer").hide();
	if($(".question-outer[data-id='"+next_question.id+"']").length>0){
		$(".question-outer[data-id='"+next_question.id+"']").show()
	}else{
		create_question(next_question)
	}
}

function next_question(question_id){
	var next_question = null;
	if(question_id==null){
		next_question = db.questions().first();
	}else{
		question_id = parseInt(question_id);
		if(question_id==360){
			var branch = get_branch();
			if(branch==null){
				return;
			}else if(branch!='没有关注'){
//				db.questions({branch:branch}).each(function(q){
//					next_question = q
//				})
				next_question = db.questions({branch:branch}).first();
			}else{
				submit();
				return
			}
		}else{
			db.questions({id:question_id}).each(function(question){
					
					next_question = db.questions({branch:question.branch,id:{'>':question_id}}).first();
			})
		}
	}
	if(next_question.id==360){
		submit();
		return
	}
	$(".question-outer").hide();
	if($(".question-outer[data-id='"+next_question.id+"']").length>0){
		$(".question-outer[data-id='"+next_question.id+"']").show()
	}else{
		create_question(next_question)
	}
}

function submit(){
	send();
	$('.report').removeClass('container-fluid').addClass('container')
	setTimeout(function(){
		update_score();
	},1000)
	$(".questions").hide();
	var branch = get_branch();
	switch(branch){
		case '容颜美好':show_branch_beauty();break;
		case '优美体形':show_branch_body();break;
		case '免疫力方面':show_branch_immunity();break;		
		case '精力脑力':show_branch_energy();break;
		case '抗衰老方面':show_branch_fading();break;		
		case '没有关注':show_branch_basic();break;				
		// default:console.log('branch is invalid');						
	}
}

function create_question(question){
	var dom = _.template($("#question").html(),question);
	$(".questions").append(dom)
	if(question.title == '请输入您的身高体重'){
		$('.questions .body:last').append(question.content);
		$('.questions .body:last').append("<br/><div class='bmi'></div>")
	}else{
		_.each(question.items,function(id){
			var choice = db.choices({id:id}).first();
			$('.questions .body:last').append(_.template($("#choice").html(),choice))
		},this)	
	}
	
	if(question.id>1){
		$(".questions .footer:last").append("<a data-id='"+question.id+"' class='prev btn btn-primary'>上一题</a>");
	}
	if(question.branch == 'common' || db.questions({branch:question.branch,id:{'>':question.id}}).count()>0){
		$(".questions .footer:last").append("<a data-id='"+question.id+"' class='next btn pull-right btn-primary'>下一题</a>");
	}
	if(question.branch !== 'common' && db.questions({branch:question.branch,id:{'>':question.id}}).count()==0){
		$(".questions .footer:last").append("<a data-id='"+question.id+"' class='submit btn pull-right btn-primary'>提交</a>");
	}
	if(question.title == '请输入您的身高体重'){
		$(".questions .footer:last").append("<a class='btn btn-primary bmi pull-right'>计算 BMI</a>")
	}	
}
create_question.cache = [];
function create_questions(){
	db.questions().each(function(question){
		create_question(question)
	})
}	

$(function(){
	resize();
	$('.questions :checkbox').live('click',function(){
		var againest = $(this).parent().attr('data-multi_againest').split('');
		_.each(againest,function(item){
			$(this).parent().parent().find("label[data-multi_group='"+item+"'] input").prop('checked',false)
		},this)
	})
	
	$('.next').live('click',function(){
		if(get_name()=='' || get_sex()=='' || get_birthday()==''){
			show_basic_modal();
			return false
		}
		var exist = false;
		$(this).parents('.question-inner').find('.body input').each(function(){
		    if($(this).is(':checked')){
		        exist = true
		    }
		})
		// for bmi
		if($(this).parents('.question-inner').find('.body input:checkbox').length==0 && $(this).parents('.question-inner').find('.body input:radio').length==0){
			exist = true
		}
		if(!exist){
			show_question_modal();
			return false
		}

		if($(this).hasClass('disabled')){
			show_question_modal();
			return false;
		}
		next_question($(this).attr('data-id'))
	})
	
	$('.prev').live('click',function(){
		if($(this).hasClass('disabled')){
			return false;
		}		
		$('body .question-outer').hide().eq($('body .question-outer').index($(this).parents('.question-outer'))-1).show();
	})
	
	$('#birthday').datepicker({
		format:'yyyy-mm-dd'
	});
	
	$("#name").val('');
	$("#birthday").val('');
	$("[name='sex']").prop('checked',false)
	
	$("#name,#birthday,[name='sex']").change(function(){
		if($.trim($("#name").val())!='' && $.trim($("#birthday").val())!='' ){
			$(".basic .next").removeClass('disabled');
		}
	})
	
	$("div[data-id=360] input").live('click',function(){
		$("body .question-outer[data-branch!='common']:not(.basic)").remove();
	})

	$('.btn.bmi').live('click',function(){
		var bmi = compute_bmi(parseInt($("#height").val()),parseInt($("#weight").val()))
		var status = bmi_status(parseInt($("#height").val()),parseInt($("#weight").val()))
		$("div.bmi").text('您的bmi为'+bmi+','+status)
	})

	$('.tab .btn').live('click',function(){
		var target = $(this).attr('data-target');
		show_tab_base(target);
	})
	$('a.print').live('click',function(){
		window.print(); 
	})
	$(".submit").live('click',function(){
		submit();
	})
	// setTimeout('show_branch_beauty()',500)
	// setTimeout('show_branch_body()',500)	
})