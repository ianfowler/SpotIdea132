function id(idName) {
  return document.getElementById(idName);
}

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return document.querySelectorAll(selector);
}

/**
 * For this spotify project, there should be another score function
 * which formats the argument properly and normalizes the result.
 *
 * Algorithm to compute the Kendall distance between a permutation
 * and (1 2 3 ... n) in nlogn time. Shoutout CS38.
 *
 * @param {array} p - a list of integers representing the permutation
 */
function kendall(p) {
  // Aux algo
  // Count the number of pairs i,j such that
  // a[i] > b[j]
  let countPairs = (a, b) => {
    let c = 0;
    let j = 0;
    for (let i = 0; i < a.length; i++) {
      while (j < b.length && a[i] > b[j]) {
        j++;
      }
      c += j;
    }
    return c;
  };

  let kendall_helper = (p) => {
    if (p.length < 2) return 0;

    let half = Math.ceil(p.length / 2);
    let left = p.slice(0, half);
    let right = p.slice(half, p.length);

    let leftResult = kendall_helper(left);
    let rightResult = kendall_helper(right);
    let result = leftResult + rightResult + countPairs(left, right);

    for (let i = 0; i < p.length; i++) {
      if (i < half) p[i] = left[i];
      else p[i] = right[i - half];
    }

    return result;
  };

  return (kendall_helper(p) / (p.length * (p.length - 1))) * 2;
}
