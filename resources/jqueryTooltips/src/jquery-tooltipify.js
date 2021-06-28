/*
 * File:        jquery-tooltipify.js
 * Version:     0.2
 * Author:      Vincent Keizer (www.vicreative.nl)
 * Info:        www.vicreative.nl/projects/Tooltipify
 *
 * Copyright 2012-2013 Vincent Keizer, all rights reserved.
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 */
(function(factory){
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function ($) {
    // Helper methods
    var helper = {
        // Create tooltip
        createTooltip: function (data) {
            var tooltip = $('<div />', {
                'class': 'tooltipify tooltipify-hide' + (data.settings.cssClass ? ' ' + data.settings.cssClass : ''),
                'css': {
                    'position': 'absolute',
                    'opacity': '0'
                }
            }).append($('<div />', {
                    'class': 'content'
                // When content is provided, select content, when not select title attribute
                }).append(data.settings.content 
                    ? data.settings.content 
                    : $('<span />', {
                       'text': data.title,
                       'class': 'text'
                      })
                )
            ).append($('<span />', {
                'class' : 'icon'
            }));

            if (data.settings.width) {
                tooltip.css('width', data.settings.width + 'px');
            }
            return tooltip;
        },

        // Set position of tooltip
        setPosition: function (tooltip, element, settings) {
            var position = settings.displayAware
                                        ? helper.getTooltipPosition(tooltip, element, settings)
                                        : settings.position;
            if (settings.position) {
                // remove old position, could have been changed because of the display awareness.
                tooltip.removeClass(settings.position);
            }
            tooltip.addClass(position)
                    .css({
                        // The height of the tooltip does not seem to be correct, count height of all children.
                        'top': helper.getYPosition(position, settings, element, tooltip),
                        'left': helper.getXPosition(position, settings, element, tooltip)
                    });
            settings.tooltip = tooltip;
            return tooltip;
        },

        // Gets the tooltip height.
        getTooltipHeight: function (tooltip) {
            return tooltip.outerHeight(true) + (tooltip.hasClass('left') || tooltip.hasClass('right') ? 0 : tooltip.children('.icon').outerHeight(true));
        },
        // Gets the tooltip width.
        getTooltipWidth: function (tooltip) {
            return tooltip.outerWidth(true) + (tooltip.hasClass('left') || tooltip.hasClass('right') ? (tooltip.children('.icon').outerWidth(true)) : 0);
        },

        getTooltipPosition: function (tooltip, element, settings) {
            var position = settings.position;
            var windowHeight = $(window).height();
            var windowWidth = $(window).width();
            var tooltipWidth = helper.getTooltipWidth(tooltip);
            var tooltipHeight = helper.getTooltipHeight(tooltip);
            var pos = element.position();
            var leftPos = pos.left;
            var topPos = pos.top;
            var scrollTop = $(window).scrollTop();
            switch (position) {
                case 'left':
                    if (leftPos < tooltipWidth && windowWidth - leftPos > leftPos) {
                        // Not enough space on the left and more space on the right.
                        position = 'right';
                    }
                    break;
                case 'right':
                    if (windowWidth - leftPos > tooltipWidth && leftPos > windowWidth - leftPos) {
                        // Not enough space on the right and more space on the left.
                        position = 'left';
                    }
                    break;
                case 'bottom':
                    if (topPos > windowHeight + scrollTop - tooltipHeight) {
                        // Not enough space on the bottom and more space on the top.
                        position = 'top';
                    }
                    break;
                default:
                    if (topPos < tooltipHeight + scrollTop) {
                        // Not enough space on the top and more space on the bottom.
                        position = 'bottom';
                    }
                    break;
            }
            return position;
        },

        // Gets the Y position for tooltip.
        getYPosition: function (position, settings, element, tooltip) {
            var pos = element.position();
            switch (position) {
                case 'left':
                    return (pos.top + (element.outerHeight(true) / 2) + settings.offsetTop) - (helper.getTooltipHeight(tooltip) / 2);
                case 'right':
                    return (pos.top + (element.outerHeight(true) / 2) + settings.offsetTop) - (helper.getTooltipHeight(tooltip) / 2);
                case 'bottom':
                    return pos.top + element.outerHeight(true) + settings.offsetTop + tooltip.children('.icon').outerHeight(true);
                default:                    
                    return pos.top - (helper.getTooltipHeight(tooltip) + settings.offsetTop);
            }
        },
        // Gets the X position for tooltip.
        getXPosition: function (position, settings, element, tooltip) {
            var pos = element.position();
            switch (position) {
                case 'left':
                    return (pos.left + settings.offsetLeft) - helper.getTooltipWidth(tooltip);
                case 'right':
                    return pos.left + element.outerWidth(true) + (tooltip.children('.icon').outerWidth(true)) + settings.offsetLeft;
                case 'bottom':
                    return pos.left + settings.offsetLeft;
                default:
                    return pos.left + settings.offsetLeft;
            }
        }
    };
    // Tooltip events.
    var events = {
        show: function () {
            var $this = $(this);
            var data = $this.data('tooltipify');
            var tooltip = data.tooltip;
            // We don't need to show a already visible tooltip.
            if (tooltip && tooltip.length) { return; }
            var cssPosition = $this.css('position');
            if (cssPosition == 'static') {
                data.cssPosition = cssPosition;
                $this.css('position', 'relative');
            }
            tooltip = helper.createTooltip(data);
            // Save tooltip in data and add before element.
            $this.before(tooltip);
            data.tooltip = tooltip.show();
            var settings = data.settings;
            helper.setPosition(tooltip, $this, settings);
            // Create animation for animationProperty.
            var animation = { opacity: settings.opacity };
            if (settings.animationProperty) {
                var orgValue = parseInt(tooltip.css(settings.animationProperty).replace(/[^-\d\.]/g, ''));
                tooltip.css(settings.animationProperty, orgValue - settings.animationOffset);
                animation[settings.animationProperty] = '+=' + settings.animationOffset;
            }
            tooltip.removeClass('tooltipify-hide')
                   .animate(animation, settings.animationDuration, function () {
                       $(this).addClass('tooltipify-show');
                });

            $(window).bind('resize', { element: $this }, events.reInit);
        },
        hide: function () {
            var $this = $(this);
            var data = $this.data('tooltipify');
            var tooltip = data.tooltip;
            // We don't need to hide a already hidden tooltip.
            if (!tooltip || !tooltip.length || !tooltip.is(':visible')) { return; }
            if (data.cssPosition) {
                $this.css('position', data.cssPosition);
                data.cssPosition = null;
            }
            var settings = data.settings;
            // Create animation for animationProperty
            var animation = { opacity: 0 };
            if (settings.animationProperty) {
                animation[settings.animationProperty] = '-=' + settings.animationOffset;
            }
            tooltip.removeClass('tooltipify-show')
                   .animate(animation, settings.animationDuration, function () {
                       $(this).remove();
                       $this.data('tooltipify').tooltip = null;
                   });
            $(window).unbind('resize', events.reInit);
        },
        reInit: function (event) {
            var element = event.data.element;
            if (element) {
                var data = event.data.element.data('tooltipify');
                if (data) {
                    helper.setPosition(data.tooltip, element, data.settings);
                }
            }
        }
    };
    // Tooltip methods.
    var methods = {
        // Initializes a new tooltip
        init: function (options) {
            // Extend arguments with defaults.
            var settings = $.extend({
                'position': 'top',
                'offsetLeft': 0,
                'offsetTop': 0,
                'opacity': 0.8,
                'width': null,
                'animationProperty': 'left',
                'animationOffset': 50,
                'animationDuration': 100,
                'showEvent': 'mouseover',
                'hideEvent': 'mouseout',
                'displayAware': true,
                'content': null,
				'cssClass' : ''
            }, options);

            return $(this).each(function () {
                var $this = $(this);
                var data = $this.data('tooltipify');

                // If the plugin hasn't been initialized yet
                if (!data) {
                    // Create tooltip.
                    // Bind show and hide events to original event.
                    $this.bind(settings.showEvent, events.show)
                         .bind(settings.hideEvent, events.hide)
                         // Store all requiredn data.
                         .data('tooltipify', {
                             title: $this.attr('title'),
                             tabindex: $this.attr('tabindex'),
                             settings: settings
                         }).attr('title', '');

                    if (!$this.attr('tabindex')) {
                        $this.attr('tabindex', '0'); // Used for events like 'focus' and 'focusout'
                    }
                }
            });
        },
        // Destroy and cleanup of tooltipify plugin.
        destroy: function () {
            return this.each(function () {
                var $this = $(this),
					data = $this.data('tooltipify');
                if (data) {
                    $(window).unbind('.tooltipify');
                    $this.unbind(data.settings.showEvent, events.show)
                         .unbind(data.settings.hideEvent, events.hide)
                         .attr('title', data.title)
                         .attr('tabindex', data.tabindex);
                    if (data.tooltip) {
                        data.tooltip.remove();
                    }
                    if (data.cssPosition) {
                        $this.css('position', data.cssPosition);
                    }
                    $this.removeData('tooltipify');
                }
            });
        },
        // Show event for displaying the tooltip.
        show: function () {
            return this.each(function () {
                var data = $(this).data('tooltipify');
                if (data) {
                    $(this).trigger(data.settings.showEvent);
                }
            });
        },
        // Hide event for hiding tooltip.
        hide: function () {
            return this.each(function () {
                var data = $(this).data('tooltipify');
                if (data) {
                    $(this).trigger(data.settings.hideEvent);
                }
            });
        }
    };

    // Initializer of tooltipify plugin.
    $.fn.tooltipify = function (options) {
        var method = options;
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery tooltipify');
        }
    };
}));