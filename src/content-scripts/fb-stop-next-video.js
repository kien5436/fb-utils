import isEqual from 'lodash/isEqual';

(() => {
  const upNextOverlayClassList = 'ipxafjjy j1l0snac h9pa7xm5 sbevj9st by8nzva6 jk6sbkaj kdgqqoy6 ihh4hy1g qttc61fc cdjodzko swmj3c3o m1bnnib3 soycq5t1 pedkr2u6 pmk7jnqg eezhb0co'.split(' ');
  const cancelSpanClassList = '.d2edcug0 hpfvmrgz qv66sw1b c1et5uql gk29lw5a a8c37x1j keod5gw0 nxhoafnm aigsh9s9 tia6h79c fe6kdd0r mau55g9w c8b282yb hrzyx87i a5q79mjw g1cxx5fr ekzkrbhg ljqsnud1'.split(' ').join('.');
  const observer = new MutationObserver(function(mutationList, _obs) {

    for (let i = mutationList.length; --i >= 0;) {

      const mutation = mutationList[i];

      if ('childList' === mutation.type) {

        const nodes = mutation.addedNodes;

        for (let j = nodes.length; --j >= 0;) {

          const node = nodes[j];

          if (isEqual(upNextOverlayClassList, Array.from(node.classList))) {

            node.querySelector(cancelSpanClassList).click();
            return;
          }
        }
      }
    }
  });

  observer.observe(document.body, { subtree: true, childList: true });
})();