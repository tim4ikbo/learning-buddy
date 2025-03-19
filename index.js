const filter = ([head, ...tail], predicate) => {
    if (tail.legth > 0) {
        if (predicate(head)) {
            return [hea]
        }
    }
}

const my_reduce = ([head, ...tail], fn) => {
    return  (tail.length == 0) ? head :
                fn(head, my_reduce(tail, fn));
}

const a = [1, 17, 2, -3, 5, 4];
const s = my_reduce(a.filter(x => x % 2 == 0), (result, v) => result + v);

console.log(s);


const filter = ([head, ...tail], predicate) => {
    if (head == undefined) {
        return [];
    } else {
        if (predicate(head)) {
            return [head, ...filter(tail, predicate)];
        } else {
            return filter(tail, predicate);
        }
    }
}