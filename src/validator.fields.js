/*
 * validate.fields
 *
 * method:
    1.custom rule
	validator.custom([{
		//
	}]);
	2.true or false
	validator.validate(data,function(field,error){
		//
	});
    
    //Sample:
    var V=require('Validator');
    //
    var validator=new V([{
        'field':'email',
        'vtype':'email',
        'allowBlank':false,
        'blankText':'',
        'vtypeText':'',
        'maxLength':50,
        'maxLengthText':''
    },{
        'field':'psw',
        'maxLength':20,
        'maxLengthText':'',
        'minLength':6,
        'minLengthText':''
    }]);
    
    var res=validator.validate(data,function(id,error){
        console.log(id,error);
    });
    if(!res){
        
        return;
    }
 *
 */
 
module.declare('validator.fields',function(require){
    var vregx={
        'email':/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
    };
    function Validator(rules){
        this.vtype={
            // blank
            blank:function(val){
                
                return val.length < 1 || val === '';
            },
            // minLength
            minLength:function(val,len){
                
                return val.length >= len;
            },
            // maxLength
            maxLength:function(val,len){
                
                return val.length <= len;
            },
            // email
            email:function(val){
                var reg=vregx['email'];
                
                return reg.test(val);
            },
            //equal ,only to input/textarea
            equal:function(val,id){
                
                
                return false;
            }
        };
        // default validate tips text
        this.vtext={
            blankText:'',
            minLength:'',
            maxLength:'',
            emailText:'',
            equalText:''
        };
        if(rules.constructor !== Array){
            rules=[].concat(rules);
        }
        
        this.rules=rules;
    };
    Validator.prototype={
        _r:function(rule,val,error){
            rule=rule||{};
            var field=rule.field,
                allowBlank=rule['allowBlank'],
                reg=rule['regex'];//customer regex
            if(!rule.allowOnlyWhitespace){
                val=val !== undefined ? val+'' : '';
                val=val.trim();
            }
            if(allowBlank === false){
                rule['allowBlank']='blank';
            }
            if(reg && typeof reg !== 'function'){
                rule['regex']=function(val){
                    
                    if(allowBlank !== false){
                        
                        if(val !== ''){
                                
                                return reg.test(val);
                        }
                        
                        return true;
                    }
                    
                    return reg.test(val);
                };
            }
            for(var k in rule){
                if(k === 'field' || k === 'alias'){//ignore the field
                    
                    continue;
                }
                var vk=rule[k],
                    fun=typeof vk === 'function' ? vk : this.vtype[vk];
                fun=typeof fun === 'function' ? fun : this.vtype[k];
                if(typeof  fun === 'function'){//get the validate method
                    var res=fun(val,vk),
                        alias=rule['alias'],
                        vt='';
                    res =(vk === 'blank' && (allowBlank === false  || allowBlank === 'blank')) ? !res : res;//
                    //error tips text
                    vt=!res ? (rule[k+'Text']||rule[vk+'Text']||this.vtext[k+'Text']||this.vtext[vk+'Text']||'') : vt;
                    
                    vt=vt.replace('{'+k+'}',rule[k]);//replace {validate rule}
                    if(alias && typeof alias === 'object'){
                        vt=vt.replace('{alias}',alias[rule['field']]||'');//replace name
                    }
                    
                    //error callback
                    if(error && !res){
                        error(field,vt);//
                        
                        return false;
                    }
                }
            }
            
            return true;
        },
        validate:function(data,callback,rules){
            data=data||{};
            
            rules=rules||this.rules||[];
            
            var i=0,
                len=rules.length;
            for(;i<len;i++){
                var rule=rules[i]||{},
                    field=rule.field;
                if(field && field.constructor === Array){
                    var j=0,
                        len=field.length,
                        r=[];
                    for(;j<len;j++){
                        var json=$.extend({},rule);
                        json.field=field[j];
                        r.push(json);
                    }
                    
                    if(!this.validate(data,callback,r)){
                        
                        return false;
                    }
                    
                    continue;
                }
                 
                if(!this._r(rule,data[field],callback)){
                    
                    return false;
                }
            }
            
            return true;
        },
        custom:function(rules){
            rules=rules||[];
            if(rules.constructor !== Array){
                rules=[].concat(rules);
            }
            var i=0,
                len=rules.length;
            for(;i<len;i++){
                var json=rules[i];
                for(var k in json){
                    typeof json[k] === 'function' ? this.vtype[k]=json[k] : this.vtext[k]=json[k];//bind the vtype and vtext
                }
            }
        }
    };
    
    return Validator;
});