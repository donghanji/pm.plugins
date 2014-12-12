/*
 * data.set
 * method:
    1.get data
	ds.get();
	2.set data
	ds.set(data);
    
    //Sample:
	//html:
		...
		<div id="main">
			<input type="text" data-field="fieldA"/>
			<input type="checkbox" data-field="fieldB"/>
		</div>
		...
	
	//js:
    var DataSet=require('data.set');
	var fields={
		'fieldA':'#main [data-field="fieldA"]',
		'fieldB':'#main [data-field="fieldB"]'
	};
	var get_render={
		'fieldA':function($el,fields){
			
			return $el.val();
		},
		'fieldB':function($el,fields){
			if($el.prop('checked')){

				return 1;
			}
			
			return 0;
		}
	};
	var set_render={
		'fieldB':function($el,val){
			if(val) {

				return $o.prop('checked', 'checked');
			}
			
			return $o.removeAttr('checked');
		}
	};
	
	//
    //get
	var ds=new DataSet(fields,get_render);
	var data=ds.get();
    
	//set
	var ds=new DataSet(fields,set_render);
	var data={
		'fieldA':'a',
		'fieldB':1
	};
	ds.set(data);
 *
 */
(function(){
    var $name=module.globals('$');
    module.declare('data.set',[$name],function(require){
        var $=require($name);
        
        function DataSet(fields,render,filter){
			//fields set
            this.fields=fields||{};
			//render
            this.render=render||{};
			//filter
            this.filter=filter||function(){return false;};
        };
        DataSet.prototype={
			//set data
            set:function(data){
                data=data||{};
                var fields=this.fields;
                for(var field in fields){
                    var $item=$(fields[field]),
                        val=data[field]||'',
                        render=this.render[field];
                    if(this.filter(field,data)){
                        
                        continue;
                    }
                    if(render){
						//$el,val
                        render($item,val);
                    }else{
						//default set value
                        $item.val(val);
                    }
                }
            },
			//get data
            get:function(){
                var fields=this.fields,
                    res={};
                
                for(var field in fields){
                    if(this.filter(field,fields)){
                        
                        continue;
                    }
                    var $item=$(fields[field]),
                        render=this.render[field]||function(){},
                        val=render($item,fields);
                        
                    val=val !== undefined ? val : $(fields[field]).val();
                    res[field]=val;
                }
                
                return res;
            }
        };
        
        
        return DataSet;
    });
})();