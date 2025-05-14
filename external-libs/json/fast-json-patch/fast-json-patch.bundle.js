(() => {
  // json/fast-json-patch/fast-json-patch.js
  var jsonpatch = (
    /******/
    function(modules) {
      var installedModules = {};
      function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
          return installedModules[moduleId].exports;
        }
        var module = installedModules[moduleId] = {
          /******/
          i: moduleId,
          /******/
          l: false,
          /******/
          exports: {}
          /******/
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.l = true;
        return module.exports;
      }
      __webpack_require__.m = modules;
      __webpack_require__.c = installedModules;
      __webpack_require__.d = function(exports, name, getter) {
        if (!__webpack_require__.o(exports, name)) {
          Object.defineProperty(exports, name, { enumerable: true, get: getter });
        }
      };
      __webpack_require__.r = function(exports) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
          Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(exports, "__esModule", { value: true });
      };
      __webpack_require__.t = function(value, mode) {
        if (mode & 1) value = __webpack_require__(value);
        if (mode & 8) return value;
        if (mode & 4 && typeof value === "object" && value && value.__esModule) return value;
        var ns = /* @__PURE__ */ Object.create(null);
        __webpack_require__.r(ns);
        Object.defineProperty(ns, "default", { enumerable: true, value });
        if (mode & 2 && typeof value != "string") for (var key in value) __webpack_require__.d(ns, key, function(key2) {
          return value[key2];
        }.bind(null, key));
        return ns;
      };
      __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? (
          /******/
          function getDefault() {
            return module["default"];
          }
        ) : (
          /******/
          function getModuleExports() {
            return module;
          }
        );
        __webpack_require__.d(getter, "a", getter);
        return getter;
      };
      __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      };
      __webpack_require__.p = "";
      return __webpack_require__(__webpack_require__.s = 2);
    }([
      /* 0 */
      /***/
      function(module, exports) {
        var __extends = this && this.__extends || /* @__PURE__ */ function() {
          var extendStatics = function(d, b) {
            extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
              d2.__proto__ = b2;
            } || function(d2, b2) {
              for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
            };
            return extendStatics(d, b);
          };
          return function(d, b) {
            extendStatics(d, b);
            function __() {
              this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();
        Object.defineProperty(exports, "__esModule", { value: true });
        var _hasOwnProperty = Object.prototype.hasOwnProperty;
        function hasOwnProperty(obj, key) {
          return _hasOwnProperty.call(obj, key);
        }
        exports.hasOwnProperty = hasOwnProperty;
        function _objectKeys(obj) {
          if (Array.isArray(obj)) {
            var keys_1 = new Array(obj.length);
            for (var k = 0; k < keys_1.length; k++) {
              keys_1[k] = "" + k;
            }
            return keys_1;
          }
          if (Object.keys) {
            return Object.keys(obj);
          }
          var keys = [];
          for (var i in obj) {
            if (hasOwnProperty(obj, i)) {
              keys.push(i);
            }
          }
          return keys;
        }
        exports._objectKeys = _objectKeys;
        ;
        function _deepClone(obj) {
          switch (typeof obj) {
            case "object":
              return JSON.parse(JSON.stringify(obj));
            //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
            case "undefined":
              return null;
            //this is how JSON.stringify behaves for array items
            default:
              return obj;
          }
        }
        exports._deepClone = _deepClone;
        function isInteger(str) {
          var i = 0;
          var len = str.length;
          var charCode;
          while (i < len) {
            charCode = str.charCodeAt(i);
            if (charCode >= 48 && charCode <= 57) {
              i++;
              continue;
            }
            return false;
          }
          return true;
        }
        exports.isInteger = isInteger;
        function escapePathComponent(path) {
          if (path.indexOf("/") === -1 && path.indexOf("~") === -1)
            return path;
          return path.replace(/~/g, "~0").replace(/\//g, "~1");
        }
        exports.escapePathComponent = escapePathComponent;
        function unescapePathComponent(path) {
          return path.replace(/~1/g, "/").replace(/~0/g, "~");
        }
        exports.unescapePathComponent = unescapePathComponent;
        function _getPathRecursive(root, obj) {
          var found;
          for (var key in root) {
            if (hasOwnProperty(root, key)) {
              if (root[key] === obj) {
                return escapePathComponent(key) + "/";
              } else if (typeof root[key] === "object") {
                found = _getPathRecursive(root[key], obj);
                if (found != "") {
                  return escapePathComponent(key) + "/" + found;
                }
              }
            }
          }
          return "";
        }
        exports._getPathRecursive = _getPathRecursive;
        function getPath(root, obj) {
          if (root === obj) {
            return "/";
          }
          var path = _getPathRecursive(root, obj);
          if (path === "") {
            throw new Error("Object not found in root");
          }
          return "/" + path;
        }
        exports.getPath = getPath;
        function hasUndefined(obj) {
          if (obj === void 0) {
            return true;
          }
          if (obj) {
            if (Array.isArray(obj)) {
              for (var i_1 = 0, len = obj.length; i_1 < len; i_1++) {
                if (hasUndefined(obj[i_1])) {
                  return true;
                }
              }
            } else if (typeof obj === "object") {
              var objKeys = _objectKeys(obj);
              var objKeysLength = objKeys.length;
              for (var i = 0; i < objKeysLength; i++) {
                if (hasUndefined(obj[objKeys[i]])) {
                  return true;
                }
              }
            }
          }
          return false;
        }
        exports.hasUndefined = hasUndefined;
        function patchErrorMessageFormatter(message, args) {
          var messageParts = [message];
          for (var key in args) {
            var value = typeof args[key] === "object" ? JSON.stringify(args[key], null, 2) : args[key];
            if (typeof value !== "undefined") {
              messageParts.push(key + ": " + value);
            }
          }
          return messageParts.join("\n");
        }
        var PatchError = (
          /** @class */
          function(_super) {
            __extends(PatchError2, _super);
            function PatchError2(message, name, index, operation, tree) {
              var _newTarget = this.constructor;
              var _this = _super.call(this, patchErrorMessageFormatter(message, { name, index, operation, tree })) || this;
              _this.name = name;
              _this.index = index;
              _this.operation = operation;
              _this.tree = tree;
              Object.setPrototypeOf(_this, _newTarget.prototype);
              _this.message = patchErrorMessageFormatter(message, { name, index, operation, tree });
              return _this;
            }
            return PatchError2;
          }(Error)
        );
        exports.PatchError = PatchError;
      },
      /* 1 */
      /***/
      function(module, exports, __webpack_require__) {
        Object.defineProperty(exports, "__esModule", { value: true });
        var helpers_js_1 = __webpack_require__(0);
        exports.JsonPatchError = helpers_js_1.PatchError;
        exports.deepClone = helpers_js_1._deepClone;
        var objOps = {
          add: function(obj, key, document) {
            obj[key] = this.value;
            return { newDocument: document };
          },
          remove: function(obj, key, document) {
            var removed = obj[key];
            delete obj[key];
            return { newDocument: document, removed };
          },
          replace: function(obj, key, document) {
            var removed = obj[key];
            obj[key] = this.value;
            return { newDocument: document, removed };
          },
          move: function(obj, key, document) {
            var removed = getValueByPointer(document, this.path);
            if (removed) {
              removed = helpers_js_1._deepClone(removed);
            }
            var originalValue = applyOperation(document, { op: "remove", path: this.from }).removed;
            applyOperation(document, { op: "add", path: this.path, value: originalValue });
            return { newDocument: document, removed };
          },
          copy: function(obj, key, document) {
            var valueToCopy = getValueByPointer(document, this.from);
            applyOperation(document, { op: "add", path: this.path, value: helpers_js_1._deepClone(valueToCopy) });
            return { newDocument: document };
          },
          test: function(obj, key, document) {
            return { newDocument: document, test: _areEquals(this.valueobj[key]) };
          },
          _get: function(obj, key, document) {
            this.value = obj[key];
            return { newDocument: document };
          }
        };
        var arrOps = {
          add: function(arr, i, document) {
            if (helpers_js_1.isInteger(i)) {
              arr.splice(i, 0, this.value);
            } else {
              arr[i] = this.value;
            }
            return { newDocument: document, index: i };
          },
          remove: function(arr, i, document) {
            var removedList = arr.splice(i, 1);
            return { newDocument: document, removed: removedList[0] };
          },
          replace: function(arr, i, document) {
            var removed = arr[i];
            arr[i] = this.value;
            return { newDocument: document, removed };
          },
          move: objOps.move,
          copy: objOps.copy,
          test: objOps.test,
          _get: objOps._get
        };
        function getValueByPointer(document, pointer) {
          if (pointer == "") {
            return document;
          }
          var getOriginalDestination = { op: "_get", path: pointer };
          applyOperation(document, getOriginalDestination);
          return getOriginalDestination.value;
        }
        exports.getValueByPointer = getValueByPointer;
        function applyOperation(document, operation, validateOperation, mutateDocument, banPrototypeModifications, index) {
          if (validateOperation === void 0) {
            validateOperation = false;
          }
          if (mutateDocument === void 0) {
            mutateDocument = true;
          }
          if (banPrototypeModifications === void 0) {
            banPrototypeModifications = true;
          }
          if (index === void 0) {
            index = 0;
          }
          if (validateOperation) {
            if (typeof validateOperation == "function") {
              validateOperation(operation, 0, document, operation.path);
            } else {
              validator(operation, 0);
            }
          }
          if (operation.path === "") {
            var returnValue = { newDocument: document };
            if (operation.op === "add") {
              returnValue.newDocument = operation.value;
              return returnValue;
            } else if (operation.op === "replace") {
              returnValue.newDocument = operation.value;
              returnValue.removed = document;
              return returnValue;
            } else if (operation.op === "move" || operation.op === "copy") {
              returnValue.newDocument = getValueByPointer(document, operation.from);
              if (operation.op === "move") {
                returnValue.removed = document;
              }
              return returnValue;
            } else if (operation.op === "test") {
              returnValue.test = _areEquals(document, operation.value);
              if (returnValue.test === false) {
                throw new exports.JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
              }
              returnValue.newDocument = document;
              return returnValue;
            } else if (operation.op === "remove") {
              returnValue.removed = document;
              returnValue.newDocument = null;
              return returnValue;
            } else if (operation.op === "_get") {
              operation.value = document;
              return returnValue;
            } else {
              if (validateOperation) {
                throw new exports.JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document);
              } else {
                return returnValue;
              }
            }
          } else {
            if (!mutateDocument) {
              document = helpers_js_1._deepClone(document);
            }
            var path = operation.path || "";
            var keys = path.split("/");
            var obj = document;
            var t = 1;
            var len = keys.length;
            var existingPathFragment = void 0;
            var key = void 0;
            var validateFunction = void 0;
            if (typeof validateOperation == "function") {
              validateFunction = validateOperation;
            } else {
              validateFunction = validator;
            }
            while (true) {
              key = keys[t];
              if (key && key.indexOf("~") != -1) {
                key = helpers_js_1.unescapePathComponent(key);
              }
              if (banPrototypeModifications && (key == "__proto__" || key == "prototype" && t > 0 && keys[t - 1] == "constructor")) {
                throw new TypeError("JSON-Patch: modifying `__proto__` or `constructor/prototype` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README");
              }
              if (validateOperation) {
                if (existingPathFragment === void 0) {
                  if (obj[key] === void 0) {
                    existingPathFragment = keys.slice(0, t).join("/");
                  } else if (t == len - 1) {
                    existingPathFragment = operation.path;
                  }
                  if (existingPathFragment !== void 0) {
                    validateFunction(operation, 0, document, existingPathFragment);
                  }
                }
              }
              t++;
              if (Array.isArray(obj)) {
                if (key === "-") {
                  key = obj.length;
                } else {
                  if (validateOperation && !helpers_js_1.isInteger(key)) {
                    throw new exports.JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", index, operation, document);
                  } else if (helpers_js_1.isInteger(key)) {
                    key = ~~key;
                  }
                }
                if (t >= len) {
                  if (validateOperation && operation.op === "add" && key > obj.length) {
                    throw new exports.JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", index, operation, document);
                  }
                  var returnValue = arrOps[operation.op].call(operation, obj, key, document);
                  if (returnValue.test === false) {
                    throw new exports.JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
                  }
                  return returnValue;
                }
              } else {
                if (t >= len) {
                  var returnValue = objOps[operation.op].call(operation, obj, key, document);
                  if (returnValue.test === false) {
                    debugger;
                    objOps[operation.op].call(operation, obj, key, document);
                    throw new exports.JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
                  }
                  return returnValue;
                }
              }
              if (obj[key] === void 0) {
                console.warn("fast json patch ran into missing patch path [" + operation.path + "] - inserting a dict to avoid crash");
                obj[key] = {};
                debugger;
              }
              obj = obj[key];
              if (validateOperation && t < len && (!obj || typeof obj !== "object")) {
                throw new exports.JsonPatchError("Cannot perform operation at the desired path", "OPERATION_PATH_UNRESOLVABLE", index, operation, document);
              }
            }
          }
        }
        exports.applyOperation = applyOperation;
        function applyPatch(document, patch, validateOperation, mutateDocument, banPrototypeModifications) {
          if (mutateDocument === void 0) {
            mutateDocument = true;
          }
          if (banPrototypeModifications === void 0) {
            banPrototypeModifications = true;
          }
          if (validateOperation) {
            if (!Array.isArray(patch)) {
              throw new exports.JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
            }
          }
          if (!mutateDocument) {
            document = helpers_js_1._deepClone(document);
          }
          var results = new Array(patch.length);
          for (var i = 0, length_1 = patch.length; i < length_1; i++) {
            results[i] = applyOperation(document, patch[i], validateOperation, true, banPrototypeModifications, i);
            document = results[i].newDocument;
          }
          results.newDocument = document;
          return results;
        }
        exports.applyPatch = applyPatch;
        function applyReducer(document, operation, index) {
          var operationResult = applyOperation(document, operation);
          if (operationResult.test === false) {
            throw new exports.JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
          }
          return operationResult.newDocument;
        }
        exports.applyReducer = applyReducer;
        function validator(operation, index, document, existingPathFragment) {
          if (typeof operation !== "object" || operation === null || Array.isArray(operation)) {
            throw new exports.JsonPatchError("Operation is not an object", "OPERATION_NOT_AN_OBJECT", index, operation, document);
          } else if (!objOps[operation.op]) {
            throw new exports.JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document);
          } else if (typeof operation.path !== "string") {
            throw new exports.JsonPatchError("Operation `path` property is not a string", "OPERATION_PATH_INVALID", index, operation, document);
          } else if (operation.path.indexOf("/") !== 0 && operation.path.length > 0) {
            throw new exports.JsonPatchError('Operation `path` property must start with "/"', "OPERATION_PATH_INVALID", index, operation, document);
          } else if ((operation.op === "move" || operation.op === "copy") && typeof operation.from !== "string") {
            throw new exports.JsonPatchError("Operation `from` property is not present (applicable in `move` and `copy` operations)", "OPERATION_FROM_REQUIRED", index, operation, document);
          } else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && operation.value === void 0) {
            throw new exports.JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_REQUIRED", index, operation, document);
          } else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && helpers_js_1.hasUndefined(operation.value)) {
            throw new exports.JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED", index, operation, document);
          } else if (document) {
            if (operation.op == "add") {
              var pathLen = operation.path.split("/").length;
              var existingPathLen = existingPathFragment.split("/").length;
              if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
                throw new exports.JsonPatchError("Cannot perform an `add` operation at the desired path", "OPERATION_PATH_CANNOT_ADD", index, operation, document);
              }
            } else if (operation.op === "replace" || operation.op === "remove" || operation.op === "_get") {
              if (operation.path !== existingPathFragment) {
                throw new exports.JsonPatchError("Cannot perform the operation at a path that does not exist", "OPERATION_PATH_UNRESOLVABLE", index, operation, document);
              }
            } else if (operation.op === "move" || operation.op === "copy") {
              var existingValue = { op: "_get", path: operation.from, value: void 0 };
              var error = validate([existingValue], document);
              if (error && error.name === "OPERATION_PATH_UNRESOLVABLE") {
                throw new exports.JsonPatchError("Cannot perform the operation from a path that does not exist", "OPERATION_FROM_UNRESOLVABLE", index, operation, document);
              }
            }
          }
        }
        exports.validator = validator;
        function validate(sequence, document, externalValidator) {
          try {
            if (!Array.isArray(sequence)) {
              throw new exports.JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
            }
            if (document) {
              applyPatch(helpers_js_1._deepClone(document), helpers_js_1._deepClone(sequence), externalValidator || true);
            } else {
              externalValidator = externalValidator || validator;
              for (var i = 0; i < sequence.length; i++) {
                externalValidator(sequence[i], i, document, void 0);
              }
            }
          } catch (e) {
            if (e instanceof exports.JsonPatchError) {
              return e;
            } else {
              throw e;
            }
          }
        }
        exports.validate = validate;
        function _areEquals(a, b) {
          if (a === b)
            return true;
          if (a && b && typeof a == "object" && typeof b == "object") {
            var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
            if (arrA && arrB) {
              length = a.length;
              if (length != b.length)
                return false;
              for (i = length; i-- !== 0; )
                if (!_areEquals(a[i], b[i]))
                  return false;
              return true;
            }
            if (arrA != arrB)
              return false;
            var keys = Object.keys(a);
            length = keys.length;
            if (length !== Object.keys(b).length)
              return false;
            for (i = length; i-- !== 0; )
              if (!b.hasOwnProperty(keys[i]))
                return false;
            for (i = length; i-- !== 0; ) {
              key = keys[i];
              if (!_areEquals(a[key], b[key]))
                return false;
            }
            return true;
          }
          return a !== a && b !== b;
        }
        exports._areEquals = _areEquals;
        ;
      },
      /* 2 */
      /***/
      function(module, exports, __webpack_require__) {
        var core = __webpack_require__(1);
        Object.assign(exports, core);
        var duplex = __webpack_require__(3);
        Object.assign(exports, duplex);
        var helpers = __webpack_require__(0);
        exports.JsonPatchError = helpers.PatchError;
        exports.deepClone = helpers._deepClone;
        exports.escapePathComponent = helpers.escapePathComponent;
        exports.unescapePathComponent = helpers.unescapePathComponent;
      },
      /* 3 */
      /***/
      function(module, exports, __webpack_require__) {
        Object.defineProperty(exports, "__esModule", { value: true });
        var helpers_js_1 = __webpack_require__(0);
        var core_js_1 = __webpack_require__(1);
        var beforeDict = /* @__PURE__ */ new WeakMap();
        var Mirror = (
          /** @class */
          /* @__PURE__ */ function() {
            function Mirror2(obj) {
              this.observers = /* @__PURE__ */ new Map();
              this.obj = obj;
            }
            return Mirror2;
          }()
        );
        var ObserverInfo = (
          /** @class */
          /* @__PURE__ */ function() {
            function ObserverInfo2(callback, observer) {
              this.callback = callback;
              this.observer = observer;
            }
            return ObserverInfo2;
          }()
        );
        function getMirror(obj) {
          return beforeDict.get(obj);
        }
        function getObserverFromMirror(mirror, callback) {
          return mirror.observers.get(callback);
        }
        function removeObserverFromMirror(mirror, observer) {
          mirror.observers.delete(observer.callback);
        }
        function unobserve(root, observer) {
          observer.unobserve();
        }
        exports.unobserve = unobserve;
        function observe(obj, callback) {
          var patches = [];
          var observer;
          var mirror = getMirror(obj);
          if (!mirror) {
            mirror = new Mirror(obj);
            beforeDict.set(obj, mirror);
          } else {
            var observerInfo = getObserverFromMirror(mirror, callback);
            observer = observerInfo && observerInfo.observer;
          }
          if (observer) {
            return observer;
          }
          observer = {};
          mirror.value = helpers_js_1._deepClone(obj);
          if (callback) {
            observer.callback = callback;
            observer.next = null;
            var dirtyCheck = function() {
              generate(observer);
            };
            var fastCheck = function() {
              clearTimeout(observer.next);
              observer.next = setTimeout(dirtyCheck);
            };
            if (typeof window !== "undefined") {
              window.addEventListener("mouseup", fastCheck);
              window.addEventListener("keyup", fastCheck);
              window.addEventListener("mousedown", fastCheck);
              window.addEventListener("keydown", fastCheck);
              window.addEventListener("change", fastCheck);
            }
          }
          observer.patches = patches;
          observer.object = obj;
          observer.unobserve = function() {
            generate(observer);
            clearTimeout(observer.next);
            removeObserverFromMirror(mirror, observer);
            if (typeof window !== "undefined") {
              window.removeEventListener("mouseup", fastCheck);
              window.removeEventListener("keyup", fastCheck);
              window.removeEventListener("mousedown", fastCheck);
              window.removeEventListener("keydown", fastCheck);
              window.removeEventListener("change", fastCheck);
            }
          };
          mirror.observers.set(callback, new ObserverInfo(callback, observer));
          return observer;
        }
        exports.observe = observe;
        function generate(observer, invertible) {
          if (invertible === void 0) {
            invertible = false;
          }
          var mirror = beforeDict.get(observer.object);
          _generate(mirror.value, observer.object, observer.patches, "", invertible);
          if (observer.patches.length) {
            core_js_1.applyPatch(mirror.value, observer.patches);
          }
          var temp = observer.patches;
          if (temp.length > 0) {
            observer.patches = [];
            if (observer.callback) {
              observer.callback(temp);
            }
          }
          return temp;
        }
        exports.generate = generate;
        function _generate(mirror, obj, patches, path, invertible) {
          if (obj === mirror) {
            return;
          }
          if (typeof obj.toJSON === "function") {
            obj = obj.toJSON();
          }
          var newKeys = helpers_js_1._objectKeys(obj);
          var oldKeys = helpers_js_1._objectKeys(mirror);
          var changed = false;
          var deleted = false;
          for (var t = oldKeys.length - 1; t >= 0; t--) {
            var key = oldKeys[t];
            var oldVal = mirror[key];
            if (helpers_js_1.hasOwnProperty(obj, key) && !(obj[key] === void 0 && oldVal !== void 0 && Array.isArray(obj) === false)) {
              var newVal = obj[key];
              if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null && Array.isArray(oldVal) === Array.isArray(newVal)) {
                _generate(oldVal, newVal, patches, path + "/" + helpers_js_1.escapePathComponent(key), invertible);
              } else {
                if (oldVal !== newVal) {
                  changed = true;
                  if (invertible) {
                    patches.push({ op: "test", path: path + "/" + helpers_js_1.escapePathComponent(key), value: helpers_js_1._deepClone(oldVal) });
                  }
                  patches.push({ op: "replace", path: path + "/" + helpers_js_1.escapePathComponent(key), value: helpers_js_1._deepClone(newVal) });
                }
              }
            } else if (Array.isArray(mirror) === Array.isArray(obj)) {
              if (invertible) {
                patches.push({ op: "test", path: path + "/" + helpers_js_1.escapePathComponent(key), value: helpers_js_1._deepClone(oldVal) });
              }
              patches.push({ op: "remove", path: path + "/" + helpers_js_1.escapePathComponent(key) });
              deleted = true;
            } else {
              if (invertible) {
                patches.push({ op: "test", path, value: mirror });
              }
              patches.push({ op: "replace", path, value: obj });
              changed = true;
            }
          }
          if (!deleted && newKeys.length == oldKeys.length) {
            return;
          }
          for (var t = 0; t < newKeys.length; t++) {
            var key = newKeys[t];
            if (!helpers_js_1.hasOwnProperty(mirror, key) && obj[key] !== void 0) {
              patches.push({ op: "add", path: path + "/" + helpers_js_1.escapePathComponent(key), value: helpers_js_1._deepClone(obj[key]) });
            }
          }
        }
        function compare(tree1, tree2, invertible) {
          if (invertible === void 0) {
            invertible = false;
          }
          var patches = [];
          _generate(tree1, tree2, patches, "", invertible);
          return patches;
        }
        exports.compare = compare;
      }
      /******/
    ])
  );
  getGlobalThis().JsonPatch = jsonpatch;
  JsonPatch.pathExists = function(obj, path) {
    const properties = path.split("/").slice(1);
    let currentObj = obj;
    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      if (currentObj.hasOwnProperty(prop)) {
        currentObj = currentObj[prop];
      } else {
        debugger;
        return false;
      }
    }
    return true;
  };
  JsonPatch.ensurePathExists = function(jsonObject, path) {
    const isAppendOperation = path.endsWith("/-");
    if (isAppendOperation) {
      const parentPath = path.substring(0, path.lastIndexOf("/"));
      JsonPatch.ensurePathExists(jsonObject, parentPath);
      const parentSegments = parentPath.split("/").slice(1);
      let parent = jsonObject;
      for (const seg of parentSegments) {
        if (parent[seg] === void 0) {
          parent[seg] = [];
        }
        parent = parent[seg];
      }
      if (!Array.isArray(parent)) {
        console.warn("Converting object to array at path: " + parentPath);
        if (parentSegments.length > 0) {
          const lastSegment = parentSegments[parentSegments.length - 1];
          let grandparent = jsonObject;
          for (let i = 0; i < parentSegments.length - 1; i++) {
            grandparent = grandparent[parentSegments[i]];
          }
          grandparent[lastSegment] = [];
        } else {
          throw new Error("Cannot convert root object to array");
        }
      }
      return true;
    }
    let didCreatePath = false;
    let currentObject = jsonObject;
    const pathSegments = path.split("/").slice(1);
    for (let i = 0; i < pathSegments.length; i++) {
      let segment = pathSegments[i];
      if (segment === "-") {
        if (!Array.isArray(currentObject)) {
          console.warn("Converting object to array to support '-' operation");
          currentObject = [];
        }
        continue;
      } else if (Type.isNumber(segment)) {
        segment = Number(segment);
        if (Array.isArray(currentObject)) {
          if (segment >= currentObject.length) {
            if (segment > 1e4) {
              throw new Error("Array index too large: " + segment);
            }
            const remainingPath = pathSegments.slice(i + 1);
            let needsArray = false;
            if (remainingPath.length > 0) {
              const knownArrayPaths = [
                "activeCreatures",
                "bestiary",
                "creatures",
                "characters",
                "nonPlayerCharacters"
              ];
              if (knownArrayPaths.includes(remainingPath[0])) {
                needsArray = true;
                console.log(`Path ${remainingPath[0]} is a known array path`);
              }
              const nextSegment = remainingPath[0];
              if (nextSegment === "-" || Type.isNumber(nextSegment)) {
                needsArray = true;
              }
            }
            let fillValue = needsArray ? [] : {};
            if (i === pathSegments.length - 1) {
              while (currentObject.length <= segment) {
                currentObject.push(void 0);
              }
            } else {
              console.log(`Filling array at index ${segment} with ${needsArray ? "arrays" : "objects"}`);
              while (currentObject.length <= segment) {
                if (needsArray) {
                  currentObject.push([]);
                } else {
                  currentObject.push({});
                }
              }
            }
            didCreatePath = true;
          }
        }
      }
      if (Type.isUndefined(currentObject[segment])) {
        const currentPath = pathSegments.slice(0, i + 1).join("/");
        const nextSegment = i + 1 < pathSegments.length ? pathSegments[i + 1] : void 0;
        const nextIsArray = nextSegment === "-" || Type.isNumber(nextSegment);
        const nextObject = nextIsArray ? [] : {};
        console.log("JsonPatch.ensurePathExists() Creating missing path: [" + currentPath + "]");
        currentObject[segment] = nextObject;
        didCreatePath = true;
      }
      currentObject = currentObject[segment];
    }
    if (!path.endsWith("/-")) {
      assert(JsonPatch.pathExists(jsonObject, path));
    }
    return didCreatePath;
  };
  JsonPatch.applyPatchWithAutoCreation = function(jsonObject, patch) {
    for (const operation of patch) {
      if (operation.op === "add" && operation.path.endsWith("/-")) {
        const parentPath = operation.path.substring(0, operation.path.lastIndexOf("/"));
        JsonPatch.ensurePathExists(jsonObject, parentPath);
        const parentSegments = parentPath.split("/").slice(1);
        let parent = jsonObject;
        for (const seg of parentSegments) {
          parent = parent[seg];
        }
        if (!Array.isArray(parent)) {
          console.warn("Converting object to array at path: " + parentPath);
          const grandparentPath = parentSegments.slice(0, -1);
          const lastSegment = parentSegments[parentSegments.length - 1];
          let grandparent = jsonObject;
          for (let i = 0; i < grandparentPath.length; i++) {
            grandparent = grandparent[grandparentPath[i]];
          }
          grandparent[lastSegment] = [];
        }
      } else {
        JsonPatch.ensurePathExists(jsonObject, operation.path);
      }
    }
    return JsonPatch.applyPatch(jsonObject, patch);
  };
})();
/*! fast-json-patch, version: 3.1.1 */
/*!
 * https://github.com/Starcounter-Jack/JSON-Patch
 * (c) 2017-2022 Joachim Wester
 * MIT licensed
 */
/*!
 * https://github.com/Starcounter-Jack/JSON-Patch
 * (c) 2017-2021 Joachim Wester
 * MIT license
 */
//# sourceMappingURL=fast-json-patch.bundle.js.map
