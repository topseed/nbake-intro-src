function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;function itemsDBind(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (items) {// iterate items
;(function(){
  var $$obj = items;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var item = $$obj[pug_index0];
pug_html = pug_html + "\u003Ca class=\"ui blurring fluid blue card\" href=\"#{item.url}\"\u003E\u003Cdiv class=\"image\"\u003E\u003Cimg" + (pug_attr("src", item.image, true, false)) + "\u002F\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"content\"\u003E\u003Cdiv class=\"header\"\u003E" + (pug_escape(null == (pug_interp = item.title) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E\u003Cdiv class=\"meta\"\u003E" + (pug_escape(null == (pug_interp = item.created) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E\u003Cdiv class=\"description\"\u003E" + (pug_escape(null == (pug_interp = item.content_html) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"extra content\"\u003EAuthor info here\u003C\u002Fdiv\u003E\u003C\u002Fa\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var item = $$obj[pug_index0];
pug_html = pug_html + "\u003Ca class=\"ui blurring fluid blue card\" href=\"#{item.url}\"\u003E\u003Cdiv class=\"image\"\u003E\u003Cimg" + (pug_attr("src", item.image, true, false)) + "\u002F\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"content\"\u003E\u003Cdiv class=\"header\"\u003E" + (pug_escape(null == (pug_interp = item.title) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E\u003Cdiv class=\"meta\"\u003E" + (pug_escape(null == (pug_interp = item.created) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E\u003Cdiv class=\"description\"\u003E" + (pug_escape(null == (pug_interp = item.content_html) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"extra content\"\u003EAuthor info here\u003C\u002Fdiv\u003E\u003C\u002Fa\u003E";
    }
  }
}).call(this);
}.call(this,"items" in locals_for_with?locals_for_with.items:typeof items!=="undefined"?items:undefined));;return pug_html;}