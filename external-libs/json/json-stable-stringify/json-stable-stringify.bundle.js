(() => {
  // json/json-stable-stringify/json-stable-stringify.js
  JSON.stableStringify = function(obj, opts) {
    var json = JSON;
    var isArray = Array.isArray || function(x) {
      return {}.toString.call(x) === "[object Array]";
    };
    var objectKeys = Object.keys || function(obj2) {
      var has = Object.prototype.hasOwnProperty || function() {
        return true;
      };
      var keys = [];
      for (var key in obj2) {
        if (has.call(obj2, key)) keys.push(key);
      }
      return keys;
    };
    if (!opts) opts = {};
    if (typeof opts === "function") opts = { cmp: opts };
    var space = opts.space || "";
    if (typeof space === "number") space = Array(space + 1).join(" ");
    var cycles = typeof opts.cycles === "boolean" ? opts.cycles : false;
    var replacer = opts.replacer || function(key, value) {
      return value;
    };
    var cmp = opts.cmp && /* @__PURE__ */ function(f) {
      return function(node) {
        return function(a, b) {
          var aobj = { key: a, value: node[a] };
          var bobj = { key: b, value: node[b] };
          return f(aobj, bobj);
        };
      };
    }(opts.cmp);
    var seen = [];
    return function stringify(parent, key, node, level) {
      var indent = space ? "\n" + new Array(level + 1).join(space) : "";
      var colonSeparator = space ? ": " : ":";
      if (node && node.toJSON && typeof node.toJSON === "function") {
        node = node.toJSON();
      }
      node = replacer.call(parent, key, node);
      if (node === void 0) {
        return;
      }
      if (typeof node !== "object" || node === null) {
        return json.stringify(node);
      }
      if (isArray(node)) {
        var out = [];
        for (var i = 0; i < node.length; i++) {
          var item = stringify(node, i, node[i], level + 1) || json.stringify(null);
          out.push(indent + space + item);
        }
        return "[" + out.join(",") + indent + "]";
      } else {
        if (seen.indexOf(node) !== -1) {
          if (cycles) return json.stringify("__cycle__");
          throw new TypeError("Converting circular structure to JSON");
        } else seen.push(node);
        var keys = objectKeys(node).sort(cmp && cmp(node));
        var out = [];
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = stringify(node, key, node[key], level + 1);
          if (!value) continue;
          var keyValue = json.stringify(key) + colonSeparator + value;
          ;
          out.push(indent + space + keyValue);
        }
        seen.splice(seen.indexOf(node), 1);
        return "{" + out.join(",") + indent + "}";
      }
    }({ "": obj }, "", obj, 0);
  };
  JSON.stableStringifyEfficient = function(obj, opts) {
    var json = JSON;
    var isArray = Array.isArray || function(x) {
      return {}.toString.call(x) === "[object Array]";
    };
    var objectKeys = Object.keys || function(obj2) {
      var has = Object.prototype.hasOwnProperty || function() {
        return true;
      };
      var keys = [];
      for (var key in obj2) {
        if (has.call(obj2, key)) keys.push(key);
      }
      return keys;
    };
    if (!opts) opts = {};
    if (typeof opts === "function") opts = { cmp: opts };
    var space = opts.space || "";
    if (typeof space === "number") space = Array(space + 1).join(" ");
    var cycles = typeof opts.cycles === "boolean" ? opts.cycles : false;
    var replacer = opts.replacer || function(key, value) {
      return value;
    };
    var cmp = opts.cmp && /* @__PURE__ */ function(f) {
      return function(node) {
        return function(a, b) {
          var aobj = { key: a, value: node[a] };
          var bobj = { key: b, value: node[b] };
          return f(aobj, bobj);
        };
      };
    }(opts.cmp);
    var seen = /* @__PURE__ */ new Map();
    return function stringify(parent, key, node, level) {
      var indent = space ? "\n" + new Array(level + 1).join(space) : "";
      var colonSeparator = space ? ": " : ":";
      if (node && node.toJSON && typeof node.toJSON === "function") {
        node = node.toJSON();
      }
      node = replacer.call(parent, key, node);
      if (node === void 0) {
        return;
      }
      if (typeof node !== "object" || node === null) {
        return json.stringify(node);
      }
      if (isArray(node)) {
        var out = [];
        for (var i = 0; i < node.length; i++) {
          var item = stringify(node, i, node[i], level + 1) || json.stringify(null);
          out.push(indent + space + item);
        }
        return "[" + out.join(",") + indent + "]";
      } else {
        const seenCount = seen.get(node) || 0;
        if (seenCount > 0) {
          if (cycles) return json.stringify("__cycle__");
          throw new TypeError("Converting circular structure to JSON");
        }
        seen.set(node, seenCount + 1);
        var keys = objectKeys(node).sort(cmp && cmp(node));
        var out = [];
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = stringify(node, key, node[key], level + 1);
          if (!value) continue;
          var keyValue = json.stringify(key) + colonSeparator + value;
          out.push(indent + space + keyValue);
        }
        seen.set(node, seen.get(node) - 1);
        return "{" + out.join(",") + indent + "}";
      }
    }({ "": obj }, "", obj, 0);
  };
})();
//# sourceMappingURL=json-stable-stringify.bundle.js.map
