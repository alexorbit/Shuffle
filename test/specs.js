jasmine.getFixtures().fixturesPath = 'fixtures';

describe('Shuffle.js', function() {
  var $ = window.jQuery;
  var Modernizr = window.Modernizr;

  describe('regular markup', function() {

    var $shuffle;
    beforeEach(function() {
      loadFixtures('regular.html');
      $shuffle = $('#regular-shuffle');
    });

    afterEach(function(done) {
      var shuffle = $shuffle.data('shuffle');
      $shuffle = null;

      if (!shuffle) {
        return done();
      }

      function finish() {
        shuffle.destroy();
        done();
      }

      if (shuffle.initialized) {
        setTimeout(finish, 0);
      } else {
        shuffle.$el.one('done.shuffle', finish);
      }

    });

    it('should get default options', function() {
      $('#regular-shuffle').shuffle();
      expect($('#regular-shuffle')).toHaveData('shuffle');
      var shuffle = $('#regular-shuffle').data('shuffle');
      expect(shuffle.$items.length).toBe(10);
      expect(shuffle.visibleItems).toBe(10);
      expect(shuffle.group).toBe('all');
      expect(shuffle.speed).toBe(250);
      expect(shuffle.itemSelector).toBe('');
      expect(shuffle.sizer).toBe(null);
      expect(shuffle.columnWidth).toBe(0);
      expect(shuffle.gutterWidth).toBe(0);
      expect(shuffle.delimeter).toBe(null);
      expect(shuffle.initialSort).toBe(null);
      expect(shuffle.throttleTime).toBe(300);
      expect(shuffle.sequentialFadeDelay).toBe(150);
      expect(shuffle.useSizer).toBe(false);
      expect(shuffle.unique).toBe('shuffle_0');
    });

    it('should add classes and default styles', function() {
      $('#regular-shuffle').shuffle();
      var shuffle = $('#regular-shuffle').data('shuffle');
      expect(shuffle.$el).toHaveClass('shuffle');
      expect(shuffle.$items).toHaveClass('shuffle-item filtered');
      expect(shuffle.$el).toHaveCss({
        position: 'relative',
        overflow: 'hidden'
      });
      expect(shuffle.$items).toHaveCss({
        opacity: '1',
        position: 'absolute',
        visibility: 'visible'
      });
      expect(shuffle.containerWidth).not.toBe(0);
    });


    it('should be 3 columns with gutters', function() {
      $shuffle.css({
        width: '1000px'
      });
      $shuffle.children().css({
        width: '300px',
        height: '150px'
      });
      $shuffle.shuffle({
        columnWidth: 300,
        gutterWidth: 50
      });

      var shuffle = $shuffle.data('shuffle');

      expect(shuffle.colWidth).toBe(350);
      expect(shuffle.cols).toBe(3);
      expect(shuffle.positions).toEqual([600, 450, 450]);
    });


    it('can have a function for columns and gutters', function() {
      $shuffle.css({
        width: '1000px'
      });
      $shuffle.children().css({
        width: '300px',
        height: '150px'
      });
      $shuffle.shuffle({
        columnWidth: function(containerWidth) {
          expect(containerWidth).toBe(1000);
          return 300;
        },
        gutterWidth: function() {
          return 50;
        }
      });

      var shuffle = $shuffle.data('shuffle');

      expect(shuffle._getGutterSize(1000)).toBe(50);
      expect(shuffle._getColumnSize(1000, 50)).toBe(350);
      expect(shuffle.colWidth).toBe(350);
      expect(shuffle.cols).toBe(3);
      expect(shuffle.positions).toEqual([600, 450, 450]);
    });

    it('can filter by the data attribute', function(done) {
      var shuffle = $shuffle.shuffle({
        speed: 100
      }).data('shuffle');

      function first() {
        shuffle.shuffle('design');
        $shuffle.one('layout.shuffle', second);
      }

      function second() {
        expect(shuffle.visibleItems).toBe(3);
        var $concealedItems = $('#item3, #item4, #item5, #item6, #item7, #item8, #item10');
        var $filteredItems = $('#item1, #item2, #item9');
        expect($concealedItems).toHaveClass('concealed');
        expect($filteredItems).toHaveClass('filtered');
        expect($concealedItems).toHaveCss({
          visibility: 'hidden'
        });

        // Filter by green.
        shuffle.shuffle('green');
        $shuffle.one('layout.shuffle', third);
      }

      function third() {
        expect(shuffle.visibleItems).toBe(2);
        var $concealedItems = $('#item1, #item2, #item5, #item6, #item7, #item8, #item9, #item10');
        var $filteredItems = $('#item3, #item4');
        expect($concealedItems).toHaveClass('concealed');
        expect($filteredItems).toHaveClass('filtered');
        done();
      }

      $shuffle.one('done.shuffle', first);
    });

    it('can shuffle by function', function(done) {
      var shuffle = $shuffle.shuffle({
        speed: 100
      }).data('shuffle');

      function first() {
        shuffle.shuffle(function($el) {
          return parseInt($el.attr('id').substring(4), 10) <= 5;
        });
        $shuffle.one('layout.shuffle', second);
      }

      function second() {
        expect(shuffle.visibleItems).toBe(5);
        var $concealedItems = $('#item6, #item7, #item8, #item9, #item10');
        var $filteredItems = $('#item1, #item2, #item3, #item4, #item5');
        expect($concealedItems).toHaveClass('concealed');
        expect($filteredItems).toHaveClass('filtered');
        expect(shuffle.isTransitioning).toBe(false);
        done();
      }

      // First shuffle is async.
      $shuffle.one('done.shuffle', first);
    });

    it('can shuffle by function without transitions', function(done) {
      var shuffle = $shuffle.shuffle({
        speed: 100,
        supported: false
      }).data('shuffle');

      function first() {
        shuffle.shuffle(function($el) {
          return parseInt($el.attr('id').substring(4), 10) <= 5;
        });
        $shuffle.one('layout.shuffle', second);
      }

      function second() {
        expect(shuffle.visibleItems).toBe(5);
        var $concealedItems = $('#item6, #item7, #item8, #item9, #item10');
        var $filteredItems = $('#item1, #item2, #item3, #item4, #item5');
        expect($concealedItems).toHaveClass('concealed');
        expect($filteredItems).toHaveClass('filtered');
        expect(shuffle.isTransitioning).toBe(false);
        done();
      }

      // First shuffle is async.
      $shuffle.one('done.shuffle', first);
    });

    it('can initialize filtered and the category parameter is optional', function(done) {
        var shuffle = $shuffle.shuffle({
          speed: 100,
          group: 'design'
        }).data('shuffle');

        expect(shuffle.visibleItems).toBe(3);

        function first() {
          expect(shuffle.visibleItems).toBe(10);
          done();
        }

        $shuffle.one('layout.shuffle', first);
        shuffle.shuffle();
    });

    it('can initialize sorted', function() {

        var sortObj = {
          by: function($el) {
            return parseInt($el.attr('data-age'), 10);
          }
        };

        var shuffle = $shuffle.shuffle({
          speed: 100,
          initialSort: sortObj
        }).data('shuffle');

        expect(shuffle.lastSort).toEqual(sortObj);
    });

    describe('inserting elements', function() {

      var $collection;

      beforeEach(function() {
        var $eleven = $('<div>', {
          'class': 'item',
          'data-age': 36,
          'data-groups': '["ux", "black"]',
          id: 'item11',
          text: 'Person 11'
        });
        var $twelve = $('<div>', {
          'class': 'item',
          'data-age': 37,
          'data-groups': '["strategy", "blue"]',
          id: 'item12',
          text: 'Person 12'
        });

        $collection = $eleven.add($twelve);
      });

      afterEach(function() {
        $collection = null;
      });


      it('can add items', function(done) {
        var shuffle = $shuffle.shuffle({
          speed: 100,
          group: 'black'
        }).data('shuffle');

        function first() {
          $shuffle.append($collection);
          shuffle.appended($collection);

          // Already 2 in the items, plus number 11.
          expect(shuffle.visibleItems).toBe(3);


          $shuffle.one('layout.shuffle', function() {
            expect(shuffle.isTransitioning).toBe(false);
            done();
          });
        }

        $shuffle.one('done.shuffle', first);
      });

      it('can add items without transitions', function(done) {
        var shuffle = $shuffle.shuffle({
          speed: 100,
          group: 'black',
          supported: false
        }).data('shuffle');

        function first() {
          $shuffle.append($collection);
          shuffle.appended($collection);

          // Already 2 in the items, plus number 11.
          expect(shuffle.visibleItems).toBe(3);

          $shuffle.one('layout.shuffle', function() {
            expect(shuffle.isTransitioning).toBe(false);
            done();
          });
        }

        $shuffle.one('done.shuffle', first);
      });

    });


    it('can call appended with different options', function() {
      var shuffle = $shuffle.shuffle({
        speed: 100
      }).data('shuffle');

      spyOn(shuffle, '_addItems').and.callFake(function() {});

      shuffle.appended(null, true, true);
      expect(shuffle._addItems).toHaveBeenCalledWith(null, true, true);
      shuffle.appended(null, false, false);
      expect(shuffle._addItems).toHaveBeenCalledWith(null, false, false);
      shuffle.appended(null);
      expect(shuffle._addItems).toHaveBeenCalledWith(null, false, true);
      shuffle.appended(null, null, null);
      expect(shuffle._addItems).toHaveBeenCalledWith(null, false, true);
    });


    describe('removing elements', function() {
      var shuffle;
      var $itemsToRemove;
      var onDone;
      var onRemoved;

      beforeEach(function() {
        $itemsToRemove = $shuffle.children().slice(0, 2);
        onDone = function() {
          shuffle.remove($itemsToRemove);
          $shuffle.one('removed.shuffle', onRemoved);
        };
      });
      afterEach(function() {
        $itemsToRemove = null;
        shuffle = null;
        onDone = null;
        onRemoved = null;
      });

      it('can remove items', function(done) {
        shuffle = $shuffle.shuffle({
          speed: 100
        }).data('shuffle');

        onRemoved = function(evt, $items, instance) {
          expect(instance.visibleItems).toBe(8);
          expect($items[0].id).toBe('item1');
          expect($items[1].id).toBe('item2');
          expect($shuffle.children().length).toBe(8);
          expect(instance.isTransitioning).toBe(false);

          done();
        };

        $shuffle.one('done.shuffle', onDone);
      });


      it('can remove items without transitions', function(done) {
        shuffle = $shuffle.shuffle({
          speed: 100,
          supported: false
        }).data('shuffle');

        onRemoved = function(evt, $items, instance) {
          expect(instance.visibleItems).toBe(8);
          expect($items[0].id).toBe('item1');
          expect($items[1].id).toBe('item2');
          expect($shuffle.children().length).toBe(8);
          expect(instance.isTransitioning).toBe(false);

          done();
        };

        $shuffle.one('done.shuffle', onDone);
      });
    });


    it('can get an element option', function() {
      var shuffle = $shuffle.shuffle({
        speed: 100
      }).data('shuffle');

      var $first = $shuffle.children().first();

      expect(shuffle._getElementOption($first)).toEqual($first[0]);
      expect(shuffle._getElementOption($first[0])).toEqual($first[0]);
      expect(shuffle._getElementOption('#item1')).toEqual($first[0]);
      expect(shuffle._getElementOption('#hello-world')).toEqual(null);
      expect(shuffle._getElementOption(null)).toEqual(null);
      expect(shuffle._getElementOption(undefined)).toEqual(null);
      expect(shuffle._getElementOption(function() {
        return $first;
      })).toEqual(null);
    });

    it('can test elements against filters', function() {
      var shuffle = $shuffle.shuffle({
        speed: 100
      }).data('shuffle');

      var $first = $shuffle.children().first();
      expect(shuffle._doesPassFilter('design', $first)).toBe(true);
      expect(shuffle._doesPassFilter('black', $first)).toBe(false);
      expect(shuffle._doesPassFilter(function($el) {
        expect($el).toExist();
        return $el.attr('data-age') === '21';
      }, $first)).toBe(true);
      expect(shuffle._doesPassFilter(function($el) {
        return $el.attr('data-age') === '22';
      }, $first)).toBe(false);
    });

    it('can initialize a collection of items', function() {
      var shuffle = $shuffle.shuffle({
        speed: 100
      }).data('shuffle');

      var $eleven = $('<div>', {
        'class': 'item',
        'data-age': 36,
        'data-groups': '["ux", "black"]',
        id: 'item11',
        text: 'Person 11'
      });
      var $twelve = $('<div>', {
        'class': 'item',
        'data-age': 37,
        'data-groups': '["strategy", "blue"]',
        id: 'item12',
        text: 'Person 12'
      });

      var $collection = $eleven.add($twelve);

      expect($collection).not.toHaveClass('shuffle-item');
      expect($collection).not.toHaveClass('filtered');
      expect($collection).not.toHaveData('point');
      shuffle._initItems($collection);
      expect($collection).toHaveClass('shuffle-item');
      expect($collection).toHaveClass('filtered');
      expect($collection).toHaveData('point');
    });


    it('should reset columns', function() {
      var shuffle = $shuffle.shuffle({
        speed: 100
      }).data('shuffle');

      expect(shuffle.cols).toBeGreaterThan(0);
      shuffle._resetCols();

      var positions = new Array(shuffle.cols);
      for (var i = 0; i < shuffle.cols; i++) {
        positions[i] = 0;
      }
      expect(shuffle.positions).toEqual(positions);
    });

    it('should destroy properly', function(done) {
      var shuffle = $shuffle.shuffle({
        speed: 100
      }).data('shuffle');
      var $items = shuffle.$items;

      function first() {
        shuffle.destroy();

        expect(shuffle.element).toBe(null);
        expect(shuffle.$items).toBe(null);
        expect(shuffle.sizer).toBe(null);
        expect(shuffle.$el).toBe(null);

        expect($shuffle).not.toHaveData('shuffle');
        expect($shuffle).not.toHaveClass('shuffle');
        expect($items).not.toHaveClass('shuffle-item');
        expect($items).not.toHaveClass('filtered');
        expect($items).not.toHaveClass('concealed');
        expect($items).not.toHaveData('point');
        expect($items).not.toHaveData('scale');

        done();
      }

      $shuffle.one('done.shuffle', first);
    });

    it('should not update or shuffle when disabled or destroyed', function(done) {
      var shuffle = $shuffle.shuffle({
        speed: 100
      }).data('shuffle');

      function first() {
        spyOn(shuffle, 'update');
        spyOn(shuffle, '_filter');

        shuffle.disable();

        shuffle.shuffle('design');

        expect(shuffle._filter).not.toHaveBeenCalled();
        expect(shuffle.update).not.toHaveBeenCalled();

        shuffle.enable(false);

        shuffle.destroy();
        shuffle._onResize();
        expect(shuffle.update).not.toHaveBeenCalled();
        done();
      }

      $shuffle.one('done.shuffle', first);
    });

    it('should not update when the container is the same size', function(done) {
      var shuffle = $shuffle.shuffle({
        speed: 100
      }).data('shuffle');

      function first() {
        spyOn(shuffle, 'update');

        shuffle._onResize();

        expect(shuffle.update).not.toHaveBeenCalled();
        done();
      }

      $shuffle.one('done.shuffle', first);
    });

    it('can get the real width of an element which is scaled', function() {
      var div = document.createElement('div');
      div.style.cssText = 'width:100px;height:100px;';
      div.style[Modernizr.prefixed('transform')] = window.Shuffle._getItemTransformString({
        x: 0,
        y: 0
      }, 0.5);

      document.body.appendChild(div);

      expect(window.Shuffle._getOuterWidth(div, false)).toBe(100);
      expect(window.Shuffle._getOuterWidth(div, true)).toBe(100);

      expect(window.Shuffle._getOuterHeight(div, false)).toBe(100);
      expect(window.Shuffle._getOuterHeight(div, true)).toBe(100);

      div.style.marginLeft = '10px';
      div.style.marginRight = '20px';
      div.style.marginTop = '30px';
      div.style.marginBottom = '40px';

      expect(window.Shuffle._getOuterWidth(div, false)).toBe(100);
      expect(window.Shuffle._getOuterWidth(div, true)).toBe(130);

      expect(window.Shuffle._getOuterHeight(div, false)).toBe(100);
      expect(window.Shuffle._getOuterHeight(div, true)).toBe(170);

      document.body.removeChild(div);
    });

  });


  describe('the sorted plugin', function() {

    beforeEach(function() {
      loadFixtures('regular.html');
    });


    it('will catch empty jQuery objects', function() {
      var $items = $();
      expect($items.sorted()).toEqual([]);
    });

    it('can randomize the elements', function() {
      var $items = $('#regular-shuffle').children();
      var array = $items.toArray();
      expect($items.length).toBe(10);
      expect($items.sorted({
        randomize: true
      })).not.toEqual(array);
    });

    it('can sort by a function', function() {
      var $items = $('#regular-shuffle').children();
      var array = $items.toArray();
      array.sort(function(a, b) {
        var age1 = parseInt(a.getAttribute('data-age'), 10);
        var age2 = parseInt(b.getAttribute('data-age'), 10);
        return age1 - age2;
      });
      var result = $items.sorted({
        by: function($el) {
          expect($el).toExist();
          return parseInt($el.attr('data-age'), 10);
        }
      });
      expect(result).toEqual(array);
    });

    it('can sort by a function and reverse it', function() {
      var $items = $('#regular-shuffle').children();
      var array = $items.toArray();
      array.sort(function(a, b) {
        var age1 = parseInt(a.getAttribute('data-age'), 10);
        var age2 = parseInt(b.getAttribute('data-age'), 10);
        return age1 - age2;
      }).reverse();
      var result = $items.sorted({
        reverse: true,
        by: function($el) {
          expect($el).toExist();
          return parseInt($el.attr('data-age'), 10);
        }
      });
      expect(result).toEqual(array);
    });

    it('will not sort without a `by` function', function() {
      var $items = $('#regular-shuffle').children();
      var array = $items.toArray();
      expect($items.sorted()).toEqual(array);
      expect($items.sorted({})).toEqual(array);
      expect($items.sorted({
        reverse: true
      })).toEqual(array.reverse());
    });

    it('will revert to DOM order if the `by` function returns undefined', function() {
      var $items = $('#regular-shuffle').children();
      var array = $items.toArray();
      var count = 0;
      expect($items.sorted({
        by: function() {
          count++;
          return count < 5 ? Math.random() : undefined;
        }
      })).toEqual(array);
    });

    it('can sort elements first', function() {
      var $items = $('#regular-shuffle').children().slice(0, 4);
      var array = $items.toArray();
      array = [ array[1], array[0], array[3], array[2] ];
      expect($items.sorted({
        by: function($el) {
          var age = $el.data('age');
          if (age === 50) {
            return 'sortFirst';
          } else {
            return age;
          }
        }
      })).toEqual(array);
    });

    it('can sort elements last', function() {
      var $items = $('#regular-shuffle').children().slice(0, 4);
      var array = $items.toArray();
      array = [ array[0], array[2], array[1], array[3] ];
      expect($items.sorted({
        by: function($el) {
          var age = $el.data('age');
          if (age === 27) {
            return 'sortLast';
          } else {
            return age;
          }
        }
      })).toEqual(array);
    });

  });

});
