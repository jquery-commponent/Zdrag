/**
 * Created by Administrator on 2017/9/28 0028.
 */
;(function($,window,document,undefind){
    var Drag = function(element,options){
        this.$element = element;
        this.ops = $.extend({},$.fn.drag.default,options);
        this.init();
    }
    Drag.prototype = {
        /**
         * 初始化插件
         *  $this           当前Drag对象
         */
        init : function(){
            console.log(this.$element);
            var $this = this;
            //初始化数据
            $this._initType();

            $this._mouseDown();
            $this._mouseMove();
            $this._mouseUp();
        },


        /**
         * @private
         * 初始化type
         *  IS_DOWN         标记当前鼠标状态是否是按下状态，初始为false，鼠标没有被按下
         *  down_x_y        记录鼠标按下时的坐标
         *  drag_block_x_y  记录移动的块的坐标
         *  move_x_y        记录移动距离
         *  $drag_handler   拖动节点
         *  movable_region  可移动区域
         */
        _initType : function(){
            var $this = this;
            $this.IS_DOWN = false;
            //移动的参考父元素，如果指定了父节点，设置为指定节点，否则设置为默认父节点
            if($this.ops.parent == "parent"){
                $this.$parent = $this.$element.parent();
            }else{
                $this.$parent = $this.$element.parents($this.ops.parent);
            }
            //判断是否设置拖动节点，如果指定了拖动节点，设置$drag_handler为指定的节点，否则，将默认的拖动块设置为拖动节点
            if ($this.ops.dragHandler === ''){
                $this.$drag_handler = $this.$element;
            }else{
                $this.$drag_handler = $($this.ops.dragHandler);
            }
            //初始化css样式
            $this._initCss();
            //鼠标按下的时候的鼠标位置
            $this.down_x_y = {
                down_x: 0,
                down_y : 0
            };
            //移动距离
            $this.move_x_y = {
                move_x : 0,
                move_y : 0
            };
            //要移动的块的位置
            $this.drag_block_x_y = {
                drag_block_x : $this.$element.position().left,
                drag_block_y : $this.$element.position().top
            };
            //可移动区域 movable_region
            $this.movable_region = {
                movable_x_left : $this.ops.movable_region[3] == 0 ? 0 : $this.ops.movable_region[3],
                movable_x_right: $this.ops.movable_region[1] == 0 ? $this.$parent.innerWidth() - $this.$element.innerWidth() : $this.ops.movable_region[1],
                movable_y_top : $this.ops.movable_region[0] == 0 ? 0 : $this.ops.movable_region[0],
                movable_y_bottom : $this.ops.movable_region[2] == 0 ? $this.$parent.innerHeight() - $this.$element.innerHeight() : $this.ops.movable_region[2]
            };
            $this._initPosition();

        },


        /**
         * @private
         * 初始化css样式
         * 将当前拖动元素的定位属性设置为absolute绝对定位
         * 如果指定了相对于指定的父元素定位，则将指定的父元素的定位设置为relative相对定位，否则，默认将拖动元素的直接父元素设置为relative相对定位
         * 设置鼠标移入拖动控件时的鼠标样式
         */
        _initCss : function(){
            var $this = this;
            $this.$element.css("position","absolute");
            $this.$parent.css("position","relative");
            $this.$drag_handler.css("cursor",$this.ops.cursor);
        },


        /**
         * @private
         * 初始化元素的位置
         */
        _initPosition : function(){
            var $this = this;
            if ($this.drag_block_x_y.drag_block_x < $this.movable_region.movable_x_left){
                $this.$element.css("left",$this.movable_region.movable_x_left);
            }
            if ($this.drag_block_x_y.drag_block_y < $this.movable_region.movable_y_top){
                $this.$element.css("top",$this.movable_region.movable_y_top);
            }
        },


        /**
         * @private
         * 鼠标弹起事件
         * 鼠标弹起来的时候将IS_DOWN状态改为false
         *
         */
        _mouseUp : function(){
            var $this = this;
            $(document).on("mouseup",function(){
                $this.IS_DOWN = false;
            })
        },


        /**
         * @private
         * 鼠标按下事件
         * 鼠标按下的时候获取鼠标的位置
         * 鼠标按下的时候获取要移动的块的位置
         */
        _mouseDown : function(){
            var $this = this;
            $this.$drag_handler.on("mousedown",function(e){
                $this.IS_DOWN = true;
                //鼠标位置
                $this.down_x_y.down_x = e.pageX;
                $this.down_x_y.down_y = e.pageY;
                console.log($this.down_x_y.down_x+"----"+$this.down_x_y.down_y);
                //要移动的块的相对位置
                $this.drag_block_x_y.drag_block_x = $this.$element.position().left;
                $this.drag_block_x_y.drag_block_y = $this.$element.position().top;
            })
        },


        /**
         * @private
         * 鼠标移动事件
         * 鼠标移动的时候获取当前鼠标的位置
         * 根据鼠标位置的变化计算出拖动的距离
         * 将拖动元素移动相应位置
         */
        _mouseMove : function(){
            var $this = this;
            if($this.ops.direction == "all"){
                $this._moveDirectionAll();
            }else if($this.ops.direction == "X" || $this.ops.direction == "x"){
                $this._moveDirectionX();
            }else if($this.ops.direction == "Y" || $this.ops.direction == "y"){
                $this._moveDirectionY();
            }

        },

        /**
         * @private
         *  拖动控件只能水平移动
         */
        _moveDirectionX : function(){
            var $this = this;
            $(document).on("mousemove",function(e){
                if ($this.IS_DOWN){
                    $this.move_x_y.move_x = e.pageX - $this.down_x_y.down_x;
                    $this.move_x_y.move_y = e.pageY - $this.down_x_y.down_y;

                    $this.$element.css({
                        top : $this.drag_block_x_y.drag_block_y + "px",
                        left : $this.drag_block_x_y.drag_block_x + $this.move_x_y.move_x + "px"
                    });
                    if (($this.drag_block_x_y.drag_block_x + $this.move_x_y.move_x) < $this.movable_region.movable_x_left){
                        $this.$element.css({
                            left : $this.movable_region.movable_x_left +"px"
                        });
                    }
                    if(($this.drag_block_x_y.drag_block_x + $this.move_x_y.move_x) > $this.movable_region.movable_x_right){
                        $this.$element.css({
                            left : $this.movable_region.movable_x_right+"px"
                        });
                    }
                }
            })
        },

        /**
         * @private
         * 拖动控件只能沿着垂直方向移动
         */
        _moveDirectionY : function(){
            var $this = this;
            $(document).on("mousemove",function(e){
                if ($this.IS_DOWN){
                    $this.move_x_y.move_x = e.pageX - $this.down_x_y.down_x;
                    $this.move_x_y.move_y = e.pageY - $this.down_x_y.down_y;

                    $this.$element.css({
                        top : $this.drag_block_x_y.drag_block_y + $this.move_x_y.move_y +"px",
                        left : $this.drag_block_x_y.drag_block_x + "px"
                    });
                    if (($this.drag_block_x_y.drag_block_y + $this.move_x_y.move_y) < $this.movable_region.movable_y_top){
                        $this.$element.css({
                            top : $this.movable_region.movable_y_top+"px"
                        });
                    }
                    if (($this.drag_block_x_y.drag_block_y + $this.move_x_y.move_y) > $this.movable_region.movable_y_bottom){
                        $this.$element.css({
                            top : $this.movable_region.movable_y_bottom +"px"
                        });
                    }
                }
            })
        },

        /**
         * @private
         * 控件移动方向为所有方向
         */
        _moveDirectionAll : function(){
            var $this = this;
            $(document).on("mousemove",function(e){
                if ($this.IS_DOWN){
                    $this.move_x_y.move_x = e.pageX - $this.down_x_y.down_x;
                    $this.move_x_y.move_y = e.pageY - $this.down_x_y.down_y;

                    $this.$element.css({
                        top : $this.drag_block_x_y.drag_block_y + $this.move_x_y.move_y +"px",
                        left : $this.drag_block_x_y.drag_block_x + $this.move_x_y.move_x + "px"
                    });
                    if (($this.drag_block_x_y.drag_block_x + $this.move_x_y.move_x) < $this.movable_region.movable_x_left){
                        $this.$element.css({
                            left : $this.movable_region.movable_x_left +"px"
                        });
                    }
                    if(($this.drag_block_x_y.drag_block_x + $this.move_x_y.move_x) > $this.movable_region.movable_x_right){
                        $this.$element.css({
                            left : $this.movable_region.movable_x_right+"px"
                        });
                    }
                    if (($this.drag_block_x_y.drag_block_y + $this.move_x_y.move_y) < $this.movable_region.movable_y_top){
                        $this.$element.css({
                            top : $this.movable_region.movable_y_top+"px"
                        });
                    }
                    if (($this.drag_block_x_y.drag_block_y + $this.move_x_y.move_y) > $this.movable_region.movable_y_bottom){
                        $this.$element.css({
                            top : $this.movable_region.movable_y_bottom +"px"
                        });
                    }
                }
            })
        }

    }
    $.fn.drag = function(options){
        var drag = new Drag(this,options);
        return this;
    };
    $.fn.drag.default = {
        cursor : 'move',            //鼠标移动到dragHandler节点上时的鼠标样式
        parent : 'parent',          //拖动控件的参考父元素
        dragHandler : '',           //触发拖动的节点
        movable_region : [0,0,0,0],  //允许拖动的区域
        direction : "all"           //拖动控件的拖动方向，默认为所有方向，允许水平方向X，和垂直方向y
    };
})(jQuery,window,document);