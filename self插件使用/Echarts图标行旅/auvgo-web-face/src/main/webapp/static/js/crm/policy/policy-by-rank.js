function deleteAir(cid){
	 confirm_s = confirm('您确定删除该条差旅政策吗?');
	 if(confirm_s){
		/*$.ajax({
             type: "POST",
             url:"/crm/chailv/gnremove/"+cid,
             success: function(data) {
            	 if (data.status == 200) {
 					layer.alert('删除成功!', {icon: 6});
 					location.replace("/crm/chailv/"+cid);
 				}if (data.status == 300){
 					 layer.msg('保存失败.', {icon: 5});
 				}
             }
         });*/
	 }
} 
function deleteHotel(id,cid){
	 confirm_ = confirm('您确定删除该条差旅政策吗?');
	 if(confirm_){
		/*$.ajax({
            type: "POST",
            url:"/crm/chailv/deleteHotelCity/"+id,
            success: function(data) {
           	 if (data.status == 200) {
					layer.alert('删除成功!', {icon: 6});
					location.replace("/crm/chailv/"+cid);
				}if (data.status == 300){
					 layer.msg('保存失败.', {icon: 5});
				}
            }
        });*/
	 }
} 
function deleteTrain(ids,cid){
	 confirm_s = confirm('您确定删除该条差旅政策吗?');
	 if(confirm_s){
		/*$.ajax({
            type: "POST",
            url:"/crm/chailv/deleteTrainPolicy/"+ids,
            success: function(data) {
           	 if (data.status == 200) {
					layer.alert('删除成功!', {icon: 6});
					location.replace("/crm/chailv/"+cid);
				}if (data.status == 300){
					 layer.msg('保存失败.', {icon: 5});
				}
            }
        });*/
	 }
} 