{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  packages = [ pkgs.foundry ];
  languages.solidity.enable = true;
}
