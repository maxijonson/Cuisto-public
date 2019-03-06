$(document).ready(function () {

    document.getElementById('button').addEventListener('click', function(){
        
        document.querySelector('.bg-modal').style.display = 'flex';
    });
    
    document.querySelector('.close').addEventListener('click', function(){
        
        document.querySelector('.bg-modal').style.display = 'none';
        
    });

    $("#formLogin").validate({

    
        rules: {
            username:
                "required",
            password: 
                "required"
        },
        errorPlacement: function(error, element){
            if(element.attr("name") == "username"){
                console.log("username")
            }
                console.log("erreur username");
                error.appendTo(element.next().next());
                
        }
    
    });
    
})




