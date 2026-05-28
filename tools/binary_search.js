export function binary_search(list, link, iter) {
    
    let right = list.length - 1
    let left = 0;


    let middle = left;
    while (left <= right) {

        middle = left + Math.floor((right - left) / 2)
        const element = list[middle];

        
        let leftorder = null;

        for (let i = 0; i < 26; i++) {
            const eli = alphabet_number(element[i])
            const linki = alphabet_number(link[i])

            leftorder = eli < linki

            if (eli === linki)
            {
                continue
            }
            else if (eli < linki)
            {
                break
            }
            else if (eli > linki)
            {
                break
            }
        }
     


        if (element.includes(link))
        {
            return true;
        }


        if (leftorder)
        {
            left = middle + 1;
        }
        else
        {
            right = middle - 1;
        }
    }

    return false
}

function alphabet_number(element) {
   
    const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

    for (let i = 0; i < alphabet.length; i++) {

        if (element === alphabet[i])
        {
            return i;
        }
    }

    return -1;
}